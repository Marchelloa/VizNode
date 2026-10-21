import http from "node:http";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

function sendTree(response, tree) {
    response.write(`data: ${JSON.stringify(tree)}\n\n`)
}

/**
 * Мост получает дерево через getCurrentTree и передаёт события в dispatchEvent.
 * Не владеет состоянием. Возвращает server и publishTree; host и port задают адрес.
 */
export function startBrowserBridge({
    getCurrentTree,
    dispatchEvent,
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
}) {
    if (typeof getCurrentTree !== "function") {
        throw new TypeError("getCurrentTree must be a function");
    }

    if (typeof dispatchEvent !== "function") {
        throw new TypeError("dispatchEvent must be a function");
    }

    const clients = new Set();

    const server = http.createServer(async (request, response) => {
        // Разрешаем CORS preflight для отправки DOM-событий.
        if (request.method === "OPTIONS" && request.url === "/api/dispatch") {
            response.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            });

            response.end();
            return;
        }

        if (request.method === "POST" && request.url === "/api/dispatch") {
            let body = "";

            for await (const chunk of request) {
                body += chunk;
            }

            let event;

            try {
                event = JSON.parse(body);
            } catch {
                response.writeHead(400, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                });

                response.end(JSON.stringify({
                    error: "Invalid JSON",
                }));
                return;
            }

            try {
                const handled = await dispatchEvent(event);

                response.writeHead(handled ? 200 : 400, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                });

                response.end(JSON.stringify({ handled }));
            } catch {
                response.writeHead(500, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                });

                response.end(JSON.stringify({
                    error: "Unable to dispatch event",
                }));
            }

            return;
        }

        if (request.method === "GET" && request.url === "/api/events") {
            response.writeHead(200, {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            });

            clients.add(response);
            sendTree(response, getCurrentTree());

            request.on("close", () => {
                clients.delete(response);
            });

            return;
        }

        response.writeHead(404, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
        });

        response.end(JSON.stringify({ error: "Not found" }));
    })

    function publishTree(tree) {
        for (const client of clients) {
            sendTree(client, tree);
        }
    }

    server.listen(port, host);

    return {
        server, 
        publishTree,
    };
}


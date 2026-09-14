import http from "node:http";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

/**
 * Отправляет UI-дерево одному SSE-клиенту.
 *
 * @param {import("node:http").ServerResponse} response
 * @param {Array<object>} tree
 * @returns {void}
 */
function sendTree(response, tree) {
    response.write(`data: ${JSON.stringify(tree)}\n\n`)
}


/**
 * Запускает локальный HTTP-мост для browser renderer.
 *
 * Мост не владеет состоянием и не строит дерево самостоятельно.
 * Актуальное дерево он получает через переданную функцию.
 *
 * @param {object} options
 * @param {Function} options.getCurrentTree — возвращает актуальное UI-дерево.
 * @param {Function} options.dispatchEvent — передаёт событие приложению.
 * @param {string} [options.host] — адрес локального интерфейса.
 * @param {number} [options.port] — порт HTTP-сервера.
 * @returns {{
 *   server: import("node:http").Server,
 *   publishTree: (tree: Array<object>) => void
 * }} HTTP-сервер и функция публикации дерева.
 */
export function startBrowserBridge({
    getCurrentTree,
    dispatchEvent,
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
}) {
    // Проверяем обязательные зависимости моста.
    if (typeof getCurrentTree !== "function") {
        throw new TypeError("getCurrentTree must be a function");
    }

    if (typeof dispatchEvent !== "function") {
        throw new TypeError("dispatchEvent must be a function");
    }

    // Храним открытые SSE-соединения browser renderer.
    const clients = new Set();

    // Обрабатываем входящие HTTP-запросы браузера.
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

        // Передаём нормализованное DOM-событие приложению.
        if (request.method === "POST" && request.url === "/api/dispatch") {
            // Собираем JSON-тело запроса.
            let body = "";

            for await (const chunk of request) {
                body += chunk;
            }

            let event;

            // Преобразуем тело запроса в объект события.
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


            // Передаём событие единому application dispatch.
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

        // Подключаем browser renderer к потоку UI-деревьев.
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

        // Отклоняем неизвестные маршруты.
        response.writeHead(404, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
        });

        response.end(JSON.stringify({ error: "Not found" }));
    })


    /**
     * Отправляет новое UI-дерево всем подключённым browser renderer.
     *
     * @param {Array<object>} tree
     * @returns {void}
     */
    function publishTree(tree) {
        for (const client of clients) {
            sendTree(client, tree);
        }
    }

    // Запускаем мост только на локальном интерфейсе.
    server.listen(port, host);

    // Возвращаем управление сервером и публикацией дерева.
    return {
        server, 
        publishTree,
    };
}



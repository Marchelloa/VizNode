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
 * @param {string} [options.host] — адрес локального интерфейса.
 * @param {number} [options.port] — порт HTTP-сервера.
 * @returns {{
 *   server: import("node:http").Server,
 *   publishTree: (tree: Array<object>) => void
 * }} HTTP-сервер и функция публикации дерева.
 */
export function startBrowserBridge({
    getCurrentTree,
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
}) {
    if (typeof getCurrentTree !== "function") {
        throw new TypeError("getCurrentTree must be a function");
    }

    const clients = new Set();

    const server = http.createServer((request, response) => {
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

        response.end(JSON.stringify({ error: "Not found"}));
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

    server.listen(port, host);

    return {
        server, 
        publishTree,
    };
}



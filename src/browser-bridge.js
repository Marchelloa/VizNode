import http from "node:http";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;


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
 * @returns {import("node:http").Server} запущенный HTTP-сервер.
 */
export function startBrowserBridge({
    getCurrentTree,
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
}) {
    if (typeof getCurrentTree !== "function") {
        throw new TypeError("getCurrentTree must be a function");
    }

    const server = http.createServer((request, response) => {
        if (request.method !== "GET" || request.url !== "/api/tree") {
            response.writeHead(404, {
                "Content-Type": "application/json; charset=utf-8",
            });
            response.end(JSON.stringify({ error: "Not found"}));
            return;
        }

        const tree = getCurrentTree();

        response.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
        });

        response.end(JSON.stringify(tree));
    });

    server.listen(port, host);

    return server;
}

import { type } from "os";
import { createEffect, createSignal, JSX, onCleanup, onMount } from "solid-js";

type ChatProps = {
  datacenter?: string;
  username: string;
};

type ChatLog = {
  username: string;
  message: string;
  type: "message" | "join" | "leave";
  timestamp: Date;
};

export const Chat = ({ datacenter, username }: ChatProps) => {
  console.log(import.meta.env.VITE_WEBSOCKET_SERVER);

  const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER);

  const [readyState, setReadyState] = createSignal(ws.readyState);

  const interval = setInterval(() => {
    setReadyState(ws.readyState);
  }, 10);

  const [chatLog, setChatLog] = createSignal<ChatLog[]>([]);

  onMount(() => {
    const messageInput = document.getElementById(
      "message-input",
    ) as HTMLInputElement;

    messageInput.focus();
  });

  createEffect(() => {
    if (readyState() === WebSocket.OPEN) {
      clearInterval(interval);

      ws.send(
        JSON.stringify({
          type: "join",
          username,
        }),
      );
    }
  });

  createEffect(() => {
    // wasteful?
    chatLog();

    const chatLogDiv = document.getElementById("chat-log") as HTMLDivElement;

    chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
  });

  const onKeyUp: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (
    e,
  ) => {
    if (e.key === "Enter") {
      const message = e.currentTarget.value.trim();
      if (message === "") {
        return;
      }

      ws.send(
        JSON.stringify({
          message: e.currentTarget.value,
          username,
          type: "message",
        }),
      );
      e.currentTarget.value = "";
    }
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const payload = JSON.parse(data.payload);

    if (payload.type === "join" && payload.username === username) {
      return;
    }

    const logItem = {
      message:
        payload.type === "join"
          ? `${payload.username} joined`
          : payload.message,
      type: payload.type,
      username: payload.username,
      timestamp: new Date(),
    };

    setChatLog((chatLog) => [...chatLog, logItem]);
  };

  onCleanup(() => {
    ws.close();
  });

  return (
    <>
      <div class="flex flex-col gap-2 h-screen w-screen p-5 bg-slate-200">
        <div class="bg-indigo-600 px-4 py-3 text-white">
          <p class="text-center text-sm font-medium">
            You're on the {datacenter} server
          </p>
        </div>

        <div id="chat-log" class="h-[90%] max-h-[90%] overflow-y-auto">
          {chatLog().map(({ message, username, timestamp, type }) => (
            <div class="px-2 py-2 mb-1 mt-2 bg-gray-100 shadow-sm rounded-lg text-gray-700 max-w-fit">
              <p>
                <span class="font-bold">
                  {type === "message" ? username : "system"}
                </span>{" "}
                <span class="text-xs">
                  {timestamp.toLocaleDateString()} -{" "}
                  {timestamp.toLocaleTimeString()}
                </span>
              </p>
              {type === "message" ? (
                message
              ) : (
                <span class="italic">{message}</span>
              )}
            </div>
          ))}
        </div>

        <div class="relative">
          <input
            class="appearance-none border pl-12 border-gray-200 focus:placeholder-gray-600 transition rounded-md w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:ring-gray-600 focus:shadow-outline"
            id="message-input"
            onKeyUp={onKeyUp}
            type="text"
            placeholder=""
          />
          <div class="absolute left-0 inset-y-0 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 ml-3 text-gray-500 p-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

import { createSignal, JSX, onCleanup, onMount } from "solid-js";

const SAMPLE_CHAT_LOG = [
  "Hello World!",
  "Hi!",
  "How are you?",
  "This is a test",
  "Where am I?",
  "Read your bibles sirs!",
  "Man I'm bored, and boredom is the first step to relapse",
  "I'm not a robot",
  "You're not?",
  "Nope",
  "What are you then?",
  "I'm a human",
  "I'm a human too",
  "How interesting",
  "Yep",
  "I'm bored",
  "Me too",
  "What is love? 🎶",
  "Baby don't hurt me",
  "Don't hurt me",
  "No more",
];

type ChatProps = {
  datacenter?: string;
  username: string;
};

export const Chat = ({ datacenter, username }: ChatProps) => {
  const [chatLog, setChatLog] = createSignal<
    { message: string; username: string; timestamp: Date }[]
  >([]);

  onMount(() => {
    const messageInput = document.getElementById(
      "message-input",
    ) as HTMLInputElement;

    messageInput.focus();
  });

  const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER);

  const onKeyUp: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (
    e,
  ) => {
    if (e.key === "Enter") {
      const message = e.currentTarget.value.trim();
      if (message === "") {
        return;
      }

      ws.send(JSON.stringify({ message: e.currentTarget.value, username }));
      e.currentTarget.value = "";
    }
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const payload = JSON.parse(data.payload);

    setChatLog((chatLog) => [
      ...chatLog,
      {
        message: payload.message,
        username: payload.username,
        timestamp: new Date(),
      },
    ]);
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
          {chatLog().map(({ message, username, timestamp }) => (
            <div class="px-2 py-2 mb-1 mt-2 bg-gray-100 shadow-sm rounded-lg text-gray-700 max-w-fit">
              <p>
                <span class="font-bold">{username}</span>{" "}
                <span class="text-xs">
                  {timestamp.toLocaleDateString()} -{" "}
                  {timestamp.toLocaleTimeString()}
                </span>
              </p>
              {message}
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

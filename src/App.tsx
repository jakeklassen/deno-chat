import clsx from "clsx";
import { createResource, createSignal, JSX, Match, Switch } from "solid-js";
import { Chat } from "./components/Chat";

const fetchDc = async () => {
  return fetch("https://data-center.deno.dev/").then(
    (res) => res.headers.get("server") ?? location.host,
  );
};

function App() {
  const [datacenter] = createResource(fetchDc);
  const [username, setUsername] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);

  const onSubmit: JSX.EventHandlerUnion<HTMLFormElement, Event> = (e) => {
    e.preventDefault();

    setSubmitted(true);
  };

  return (
    <>
      <Switch>
        <Match when={submitted()}>
          <Chat
            datacenter={datacenter() ?? location.host}
            username={username()}
          />
        </Match>
        <Match when={!submitted()}>
          <div class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-lg text-center">
              <h1 class="text-2xl font-bold sm:text-3xl">🦕 Chat</h1>

              <p class="mt-4 text-gray-500">
                A chat app built with Deno and Solid.js
              </p>
            </div>

            <form
              class="mx-auto mt-8 mb-0 max-w-md space-y-4"
              onSubmit={onSubmit}
            >
              <div>
                <label for="username" class="sr-only">
                  Username
                </label>

                <div class="relative">
                  <input
                    id="username"
                    type="text"
                    class="w-full rounded-lg border-gray-200 p-4 pr-12 text-sm shadow-sm"
                    placeholder="Enter username"
                    value={username()}
                    oninput={(e) => {
                      setUsername(e.currentTarget.value.trim());
                    }}
                  />

                  <span class="absolute inset-y-0 right-4 inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class={clsx(
                    "ml-3 inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white",
                    username() === "" && "opacity-50 cursor-not-allowed",
                  )}
                  disabled={username().length === 0}
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </Match>
      </Switch>
    </>
  );
}

export default App;

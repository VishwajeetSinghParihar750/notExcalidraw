import Tools from "../components/home/Tools";
import Canvas from "../components/home/Canvas";
import ToolStyleMenu from "../components/home/ToolStyleMenu";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { useResetCanvas, useTheme } from "../store/UiActions.store";
import type { theme } from "../store/UiActions.store";
import { useCanvasManager } from "../store/CanvasManager.store";
import CollabPopup from "../components/home/CollabPopup";
import type { collabState } from "../classes/feature/Collab/Collab";
import { useNavigate } from "react-router";

type themeInfo = { name: theme; element: ReactElement };
let themeInfoList: themeInfo[] = [
  {
    name: "light",
    element: (
      <svg
        aria-hidden="true"
        focusable="false"
        role="img"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      >
        <g stroke="currentColor" stroke-linejoin="round">
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10 4.167V2.5M14.167 5.833l1.166-1.166M15.833 10H17.5M14.167 14.167l1.166 1.166M10 15.833V17.5M5.833 14.167l-1.166 1.166M5 10H3.333M5.833 5.833 4.667 4.667"></path>
        </g>
      </svg>
    ),
  },
  {
    name: "dark",
    element: (
      <svg
        aria-hidden="true"
        focusable="false"
        role="img"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          clip-rule="evenodd"
          d="M10 2.5h.328a6.25 6.25 0 0 0 6.6 10.372A7.5 7.5 0 1 1 10 2.493V2.5Z"
          stroke="currentColor"
        ></path>
      </svg>
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  let editableTextContainer = useRef<HTMLDivElement>(null);

  const handleCanvasReset = () => {
    useResetCanvas.getState().emitResetCanvas();
  };

  const collabPopupRef = useRef<HTMLDialogElement>(null);
  const { canvasManager, collabState, roomId } = useCanvasManager();

  let collabLink = window.location.origin + `/?roomId=${roomId}`;

  let toOpenShareModal = useRef<boolean>(false);

  const handleCollabStateUpdate = (
    newVal: collabState,
    oldVal: collabState,
  ) => {
    if (newVal == "active") {
      if (oldVal == "creatingRoom") {
        navigate(`/?roomId=${roomId}`, {
          replace: true,
        });
      }
      if (toOpenShareModal.current == true) collabPopupRef.current?.showModal();
      toOpenShareModal.current = false;
    } else if (newVal == "closed") {
      navigate("/", { replace: true });
      collabPopupRef.current?.close();
    }
  };

  useEffect(() => {
    const collabStateSub = useCanvasManager.subscribe(
      (state) => state.collabState,
      (newVal, oldVal) => handleCollabStateUpdate(newVal, oldVal),
    );
    return () => {
      collabStateSub();
    };
  });

  const handleshare = () => {
    if (!canvasManager) return;

    console.log(collabState);
    if (collabState == "closed") {
      toOpenShareModal.current = true;
      console.log(toOpenShareModal);

      canvasManager.startCollab();
    } else if (collabState == "active") collabPopupRef.current?.showModal();
  };
  const handleCloseSession = () => {
    collabPopupRef.current?.close();
    canvasManager?.stopCurrentCollab();
  };

  //
  const currentTheme = useTheme((state) => state.currentTheme);
  const setCurrentTheme = useTheme((state) => state.setCurrentTheme);

  let themeElementToRender = themeInfoList.findIndex(
    (ele) => ele.name == currentTheme,
  );

  const handleThemeClick = () => {
    let nexttheme =
      themeInfoList[(themeElementToRender + 1) % themeInfoList.length].name;

    if (nexttheme == "dark") document.documentElement.classList.add("dark");
    else if (nexttheme == "light")
      document.documentElement.classList.remove("dark");

    setCurrentTheme(nexttheme);
    window.localStorage.setItem("theme", nexttheme);
  };

  return (
    <>
      <CollabPopup
        ref={collabPopupRef}
        collabLink={collabLink}
        handleCloseSession={handleCloseSession}
      />
      <div className="fixed inset-0 bg-bg text-fg ">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 max-md:left-5 max-md:translate-x-0 max-sm:bottom-5 max-sm:top-auto max-sm:left-1/2 max-sm:-translate-x-1/2">
          <Tools />
        </div>

        <div className="absolute right-5 flex top-5  gap-2 bg-bg rounded-lg">
          <button
            className="p-2.5 rounded-lg w-10 h-10 bg-surface hover:bg-brand text-fg text-sm font-semibold cursor-pointer  shadow-lg"
            onClick={handleThemeClick}
          >
            {themeInfoList[themeElementToRender].element}
          </button>

          <button
            className="p-3 rounded-lg w-10 h-10 bg-surface hover:bg-brand text-fg text-sm font-semibold cursor-pointer  shadow-lg"
            onClick={handleshare}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M5 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.25 8.917l5.5-2.834M7.25 11.083l5.5 2.834"
                stroke-width="1.5"
              ></path>
            </svg>
          </button>
          <button
            className="p-3 w-10 h-10 rounded-lg bg-surface hover:bg-brand text-fg  text-sm font-semibold cursor-pointer  shadow-lg"
            onClick={handleCanvasReset}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 1920 1920"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0"></path>{" "}
            </svg>
          </button>
        </div>

        <div className="absolute left-5 top-24 max-sm:top-5  z-0">
          <ToolStyleMenu />
        </div>
        <div className="fixed inset-0 -z-2" ref={editableTextContainer}>
          <Canvas editableTextContainer={editableTextContainer} />
        </div>
      </div>
    </>
  );
}

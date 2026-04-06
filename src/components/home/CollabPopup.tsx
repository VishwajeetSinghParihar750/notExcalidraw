import type React from "react";

type propsType = {
  collabLink: string;
  ref: React.RefObject<HTMLDialogElement | null>;
  handleCloseSession: () => void;
};
export default function CollabPopup(props: propsType) {
  const link = props.collabLink;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
  };

  return (
    <dialog ref={props.ref} className="" closedby="any">
      <div className=" fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-10 bg-surface text-fg shadow-2xl rounded-lg w-[95%] max-w-150 ">
        <div className="font-semibold text-lg mb-4">Live Collaboration</div>
        <div className="flex gap-4 text-sm max-sm:flex-col max-sm:gap-2">
          <div className="min-w-0 flex-1 py-3 px-4 bg-brand-muted2 rounded-lg flex items-center">
            <span className="truncate min-w-0 block">{link}</span>
          </div>

          <button
            className="bg-brand rounded-lg py-3 px-4 text-center text-bg flex justify-center items-center gap-2 cursor-pointer "
            onClick={handleCopyLink}
          >
            <svg
              className="w-5 h-5 "
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
              <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
            </svg>
            <span className=" cursor-pointer font-semibold">Copy Link</span>
          </button>
        </div>
        <div className="text-xs border-t border-bg-muted mt-4 pt-2">
          Stopping the session will disconnect you from the room, but you'll be
          able to continue working with the scene, locally. Note that this won't
          affect other people, and they'll still be able to collaborate on their
          version.
        </div>
        <button
          className="text-red-400 flex gap-3 items-center justify-center px-4 py-3 border border-red-400 w-fit m-auto mt-4 rounded-lg text-sm font-semibold cursor-pointer"
          onClick={props.handleCloseSession}
        >
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path
              d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z"
              stroke-width="0"
              fill="currentColor"
            ></path>
          </svg>
          <span className="">Stop Session</span>
        </button>
      </div>
    </dialog>
  );
}

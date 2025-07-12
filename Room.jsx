import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useLocation } from "react-router-dom";

export default function Room() {
  const { roomID } = useParams();
  const location = useLocation();
  const containerRef = useRef(null);
  const zpRef = useRef(null); // Store Zego instance for cleanup

  const queryParams = new URLSearchParams(location.search);
  const role_str = queryParams.get("role") || "Audience";

  const role =
    role_str === "Host"
      ? ZegoUIKitPrebuilt.Host
      : role_str === "Cohost"
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  const sharedLinks = [];

  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    sharedLinks.push({
      name: "Join as co-host",
      url:
        window.location.origin +
        window.location.pathname +
        "?roomID=" +
        roomID +
        "&role=Cohost",
    });
  }

  sharedLinks.push({
    name: "Join as audience",
    url:
      window.location.origin +
      window.location.pathname +
      "?roomID=" +
      roomID +
      "&role=Audience",
  });

  const appID = 794879209;
  const serverSecret = "4464ee02a00b1484a8138347df1ed7d3";
  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomID,
    Date.now().toString(),
    role
  );

  useEffect(() => {
    if (!roomID || !containerRef.current) return;

    const initMeeting = async () => {
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: { role },
        },
        sharedLinks,
      });
    };

    initMeeting();

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomID]);

  return (
    <div
      className="myCallContainer"
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}

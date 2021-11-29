import React, { useState, useEffect, useRef } from "react";
import Peer from "skyway-js";

export default function Vrm(roomId) {
  const peer = useRef(new Peer({ key: process.env.REACT_APP_SKYWAY }));
  const [remoteVideo, setRemoteVideo] = useState([]);
  const [room, setRoom] = useState();
  const [live, setLive] = useState(true);

  let localStream;

  const onStart = () => {
    setLive(false);
    if (peer.current) {
      if (!peer.current.open) {
        return;
      }
      const tmpRoom = peer.current.joinRoom(roomId, {
        mode: "sfu",
        stream: localStream,
      });
      tmpRoom.once("open", () => {
        console.log("=== You joined ===\n");
      });
      tmpRoom.on("peerJoin", (peerId) => {
        console.log(`=== ${peerId} joined ===\n`);
      });
      tmpRoom.on("stream", async (stream) => {
        setRemoteVideo((prev) => [
          ...prev,
          { stream: stream, peerId: stream.peerId },
        ]);
      });
      tmpRoom.on("peerLeave", (peerId) => {
        setRemoteVideo((prev) => {
          return prev.filter((video) => {
            if (video.peerId === peerId) {
              video.stream.getTracks().forEach((track) => track.stop());
            }
            return video.peerId !== peerId;
          });
        });
        console.log(`=== ${peerId} left ===\n`);
      });
      setRoom(tmpRoom);
    }
  };
  const onEnd = () => {
    setLive(true);
    if (room) {
      room.close();
      setRemoteVideo((prev) => {
        return prev.filter((video) => {
          video.stream.getTracks().forEach((track) => track.stop());
          return false;
        });
      });
    }
  };
  const castVideo = () => {
    return remoteVideo.map((video) => {
      return <RemoteVideo video={video} key={video.peerId} />;
    });
  };
  return (
    <div>
      {live ? (
        <button
          style={{
            zIndex: "1",
            border: "1px solid #ccc",
            top: "10px",
            height: "25px",
            width: "110px",
            position: "absolute",
          }}
          onClick={() => onStart()}
        >
          音声オン
        </button>
      ) : (
        <button
          style={{
            zIndex: "1",
            border: "1px solid #ccc",
            top: "10px",
            height: "25px",
            width: "110px",
            position: "absolute",
          }}
          onClick={() => onEnd()}
        >
          音声オフ
        </button>
      )}
      {castVideo()}
    </div>
  );
}

const RemoteVideo = (props) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.video.stream;
      videoRef.current.play().catch((e) => console.log(e));
    }
  }, [props.video]);
  return <audio ref={videoRef} playsInline></audio>;
};

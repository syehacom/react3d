import React, { useState, useEffect, useRef } from "react";
import Peer from "skyway-js";
import * as Tone from "tone";

export default function Vrm(roomId) {
  const peer = useRef(new Peer({ key: process.env.REACT_APP_SKYWAY }));
  // const [remoteVideo, setRemoteVideo] = useState([]);
  const [localStream, setLocalStream] = useState();
  const [room, setRoom] = useState();
  const [live, setLive] = useState(true);
  const localVideoRef = useRef(null);

  let setRemoteVideo;

  useEffect(() => {
    const micAudio = new Tone.UserMedia();
    micAudio.open().then(() => {
      const shifter = new Tone.PitchShift(7);
      const reverb = new Tone.Freeverb();
      // 加工済みの音声を受け取る空のノードを用意
      const effectedDest = Tone.context.createMediaStreamDestination();
      micAudio.connect(shifter);
      shifter.connect(reverb);
      //   リバーブを空のノードに接続
      reverb.connect(effectedDest);

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          const oldTrack = stream.getAudioTracks()[0];
          stream.removeTrack(oldTrack);
          // ストリームにエフェクトがかかった音声トラックを追加
          const effectedTrack = effectedDest.stream.getAudioTracks()[0];
          stream.addTrack(effectedTrack);

          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch((e) => console.log(e));
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }, []);
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
  // const castVideo = () => {
  //   return remoteVideo.map((video) => {
  //     return <RemoteVideo video={video} key={video.peerId} />;
  //   });
  // };
  return (
    <>
      {live ? (
        <button
          style={{
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
      <video
        style={{ width: "0px", height: "0px" }}
        ref={localVideoRef}
        playsInline
      ></video>
      {/* {castVideo()} */}
    </>
  );
}

// const RemoteVideo = (props) => {
//   const videoRef = useRef(null);
//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.srcObject = props.video.stream;
//       videoRef.current.play().catch((e) => console.log(e));
//     }
//   }, [props.video]);
//   // return <video ref={videoRef} playsInline></video>;
//   return <audio ref={videoRef} playsInline></audio>;
// };

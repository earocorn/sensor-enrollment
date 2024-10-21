import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { decompress } from 'compress-json';
import './App.css'

function App() {
  const scanner = useRef<QrScanner>();
  const videoElement = useRef<HTMLVideoElement>(null);
  const [scanData, setScanData] = useState<string>("");
  const [currentDriverName, setCurrentDriverName] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const onScan = (result: QrScanner.ScanResult) => {
    // console.log(result?.data);  
    const raw = result?.data;
    const rawJson = JSON.parse(raw);
    const decompressedData = decompress(rawJson);
    setScanData(JSON.stringify(decompressedData));
    console.log(JSON.stringify(decompressedData));
    // const data = JSON.parse(decompressedData);
    setCurrentDriverName(decompressedData?.driverName);
  }

  useEffect(() => {
    if(videoElement?.current && !scanner.current) {
      scanner.current = new QrScanner(videoElement?.current, onScan, {
        onDecodeError: console.error("Error"),
        preferredCamera: "environment",
        highlightScanRegion: true,
      });

      scanner?.current?.start()
      .then(() => console.log("Scanning"))
      .catch((err) => console.error("Error starting scanner"));
    }

    return () => {
      if(!videoElement?.current) {
        scanner?.current?.stop();
      }
    }
  }, []);

  const submitEnrollment = (driverData: any) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Basic YWRtaW46YWRtaW4=");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: (driverData),
      redirect: "follow"
    };
    
    fetch("http://localhost:8282/sensorhub/moduleapi/modules", requestOptions)
      .then(async (response) => {
        if(response.ok) {
          alert("Successfully enrolled sensor")
        }
      })
      .catch(async (error) => {
        alert("Failed to enroll sensor")
      });
  }

  return (
    <>
      <h1 className='title'>Sensor Enrollment Prototype</h1>
      <hr />
      {currentDriverName != "" && (<>
        <button onClick={() => submitEnrollment(scanData)}>Enroll</button>
      <div>
        Enroll a new <b>{scanData !== "" && (<>
      {currentDriverName}
      </>)}</b>?
      </div>
      </>)}

      {statusMessage != "" && statusMessage}
      <div className='qr-reader'>
        <video ref={videoElement} style={{ width: 500, height: 500}}/>
      </div>
    </>
  )
}

export default App

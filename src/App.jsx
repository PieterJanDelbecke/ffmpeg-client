import { useRef } from "react";
import "./App.css";

function App() {
  const sliderDragRef = useRef(null);
  const leftHandleRef = useRef(null);
  const rightHandleRef = useRef(null);

  const handleLeftDrag = (event) => { 
    let initialLeft = event.target.style.left ? Number(event.target.style.left.replace('px','')) : 0;
    let newLeftHandleLeft= null;
    const drag = (e) => {
      let offsetX = e.clientX - event.clientX ;
      // if( newLeftHandleLeft < 0){
      //   return;
      // } else if (newLeftHandleLeft > sliderDragRef.current.clientWidth){
      //   return;
      // }
      if (newLeftHandleLeft && (newLeftHandleLeft <= 0)) {
        event.target.style.left = "0px";
      } else {
        console.log(offsetX, initialLeft)
        event.target.style.left = Number(initialLeft + offsetX) + 'px';
        newLeftHandleLeft = Number(initialLeft + offsetX);
      }
      // console.log({pos1, pos2, offsetX});
    };

    const cleanUp = () => {
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    };
    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  const handleRightDrag = () => {};

  return (
    <>
      <div>
        <div className="slider_track">
          <div ref={sliderDragRef} className="slider_drag">
            <div
              ref={leftHandleRef}
              onMouseDown={handleLeftDrag}
              className="handle left_handle"
            ></div>
            <div ref={rightHandleRef} className="handle right_handle"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

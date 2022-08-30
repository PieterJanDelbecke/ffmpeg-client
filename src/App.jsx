import { useRef } from "react";
import "./App.css";

function App() {
  const sliderDragRef = useRef(null);
  const leftHandleRef = useRef(null);
  const rightHandleRef = useRef(null);

  const handleLeftDrag = (event) => {
    const intialStartLeft = leftHandleRef.current.clientLeft;
    const drag = (e) => {
      let left = e.clientX - intialStartLeft;
      const endBoundry =
        sliderDragRef.current.clientWidth -
        leftHandleRef.current.clientWidth * 2;
      const rigthStarts =
        rightHandleRef.current.offsetLeft - leftHandleRef.current.clientWidth;
      if (left <= 0) {
        left = 0;
      } else if (left >= rigthStarts) {
        left = rigthStarts;
      } else if (left >= endBoundry) {
        left = endBoundry;
      }
      leftHandleRef.current.style.left = left + "px";
    };

    const cleanUp = () => {
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    };
    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  const handleRightDrag = (event) => {
    const intialStartRight = rightHandleRef.current.offsetLeft;
    const drag = (e) => {
      console.log(e);
      let right = e.clientX - intialStartRight;
      rightHandleRef.current.style.right = right + "px";
    };

    const cleanUp = () => {
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    };
    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

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
            <div
              ref={rightHandleRef}
              onMouseDown={handleRightDrag}
              className="handle right_handle"
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

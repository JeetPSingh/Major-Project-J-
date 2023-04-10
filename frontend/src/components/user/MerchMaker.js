import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Star, Text, Image, Line } from "react-konva";
import { useNavigate, useParams } from "react-router-dom";
import configuration from "./data";
import useImage from "use-image";
import app_config from "../../config";
const { merchandise, fonts, stickers, dimensions } = configuration;

const AddImage = ({ url, size }) => {
  const imgNode = useRef(null);

  const [image] = useImage(url);
  if(image)
  image.crossOrigin = 'Anonymous';
  return (
    <Image
      image={image}
      x={((dimensions.height / 200) * 150) / 2}
      y={100}
      width={480}
      height={500}
    />
  );
};

const StickerImage = ({ url, size }) => {
  const imgNode = useRef(null);

  const [image] = useImage(url);
  return (
    <Image
      image={image}
      x={100}
      y={100}
      width={10 * size}
      height={10 * size}
      draggable
    />
  );
};

const MerchMaker = () => {
  const { merchid } = useParams();
  const [loading, setLoading] = useState(false);
  const url = app_config.backend_url;
  const [selMerch, setSelMerch] = useState(null);
  const [addedImages, setAddedImages] = useState([]);
  const [selText, setSelText] = useState(null);
  const [addedText, setAddedText] = useState([]);
  const [editorDims, setEditorDims] = useState({});
  const editLayout = useRef(null);
  const [textToAdd, setTextToAdd] = useState("");
  const [textSize, setTextSize] = useState(5);
  const [addedStickers, setAddedStickers] = useState([]);
  const [stickerSize, setStickerSize] = useState(10);
  const [selSticker, setSelSticker] = useState(null);
  const [tool, setTool] = useState("");
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const [selFile, setSelFile] = useState("");
  const stageRef = useRef(null);
  const navigate = useNavigate();

  const getMerchById = async (cb) => {
    setLoading(true);
    // const response = await fetch(url + "/merch/getbyid/" + merchid);
    // const data = await response.json();
    setLoading(false);
    // console.log(data);
    setSelMerch(merchandise[0]);
    console.log(merchandise[0]);
    // cb(data);
    cb(merchandise[0]);
  };

  useEffect(() => {
    getMerchById((merch) => {
      // setAddedImages(merch.images.map((img) => <AddImage url={img} />));
      // setAddedImages([<AddImage url={url+'/'+merch.image} />]);
      setAddedImages([<AddImage url={merch.image} />]);
      console.log(editLayout.current.clientWidth);
      setEditorDims({
        width: editLayout.current.clientWidth,
        height: editLayout.current.clientHeight,
      });
    });
  }, []);

  const addText = () => {
    const obj = {
      text: textToAdd,
      fontFamily: "Montserrat",
      fontSize: 50,
      draggable: true,
    };

    setSelText(addedText.length);
    setAddedText([...addedText, obj]);
    setTextToAdd("");
    setTextSize(50);
  };

  const updateTextSize = (size) => {
    // console.log(addedText);
    // console.log(typeof size);
    setTextSize(size);
    let tempText = addedText[selText];
    console.log(tempText);
    tempText.fontSize = parseInt(size);
    setAddedText([...addedText.slice(0, -1), tempText]);
    // const newText = [...addedText];
    // newText[selText].fontSize = size;
    // setAddedText(newText);
  };

  const updateStickerSize = (e) => {
    let size = e.target.value;
    // console.log(addedText);
    // console.log(typeof size);
    setStickerSize(size);
    let temp = addedStickers[selSticker];
    // console.log(temp);
    temp.size = parseInt(size);
    setAddedText([...addedStickers.slice(0, -1), temp]);
  };

  const addSticker = (path) => {
    const obj = {
      path: path,
      size: stickerSize,
    };
    setAddedStickers([...addedStickers, obj]);
    setSelSticker(addedStickers.length);
    // setAddedText([...addedText, obj]);
    // setTextToAdd("");
    setStickerSize(10);
    // console.log(addedStickers);
  };

  const uploadSticker = (e) => {
    const file = e.target.files[0];
    const fd = new FormData();
    // setSelFile(file);
    fd.append("myfile", file);
    fetch(url + "/util/uploadfile", {
      method: "POST",
      body: fd,
    }).then((res) => {
      if (res.status === 200) {
        console.log("file uploaded");
        addSticker(url + "/" + file.name);
      }
    });
  };

  const handleMouseDown = (e) => {
    if (tool === "") return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const revertDraw = () => {
    setLines(lines.slice(0, -1));
  };

  const finalize = () => {
    const uri = stageRef.current.toDataURL();
    console.log(uri);
    sessionStorage.setItem("merchData", JSON.stringify(selMerch));
    sessionStorage.setItem("merchImage", uri);
    navigate("/user/checkout");
  };

  return (
    <div className="col-md-11 mx-auto py-3">
      <p className="text-center display-1 fw-bold">Merchandise Customizer</p>
      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-header">
              <h3 className="m-0">Choose Option</h3>
            </div>
            <div className="card-body">
              <div>
                <h4>Add Text</h4>
                <input
                  type="text"
                  className="form-control"
                  value={textToAdd}
                  onChange={(e) => setTextToAdd(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  value={textSize}
                  onChange={(e) => updateTextSize(e.target.value)}
                />
                <button onClick={addText}>Go</button>
              </div>
              <div>
                <h4>Add Sticker</h4>
                <div class="range">
                  <input
                    type="range"
                    class="form-range"
                    min={1}
                    max={100}
                    step={1}
                    value={stickerSize}
                    onChange={updateStickerSize}
                  />
                </div>
                <label className="btn btn-primary" htmlFor="uploader">
                  {" "}
                  <i class="fa-solid fa-cloud-arrow-up"></i>{" "}
                </label>
                <input
                  hidden
                  type="file"
                  onChange={uploadSticker}
                  id="uploader"
                />
                <button
                  onClick={() => addSticker("/stickers/logo2.png")}
                >
                  Go
                </button>
              </div>
              <div>
                <h4>Draw</h4>
                <button className="btn btn-primary" onClick={revertDraw}>
                  {" "}
                  <i class="fas fa-arrow-circle-left"></i>{" "}
                </button>
                <button
                  className="btn btn-primary"
                  disabled={tool === "pen"}
                  onClick={() => {
                    setTool("pen");
                  }}
                >
                  Pen
                </button>
                <button
                  className="btn btn-primary"
                  disabled={tool === "eraser"}
                  onClick={() => setTool("eraser")}
                >
                  Eraser
                </button>
                <button onClick={() => setTool("")} className="btn btn-danger">
                  {" "}
                  <i className="fa-solid fa-circle-xmark"></i>{" "}
                </button>

                <button
                  className="btn btn-danger w-100 mt-4"
                  onClick={finalize}
                >
                  Order Merch
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-10" ref={editLayout}>
          <div
            style={{ width: editorDims.width, height: "80vh" }}
            className="shadow-lg p-3"
          >
            <Stage
              width={editorDims.width}
              height={editorDims.height}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                {addedImages}
                {addedText.map((text, index) => (
                  <Text
                    onDragStart={(e) => {
                      setSelText(index);
                      setTextSize(addedText[index].fontSize);
                    }}
                    onClick={(e) => {
                      setSelText(index);
                      setTextSize(addedText[index].fontSize);
                    }}
                    {...text}
                  />
                ))}
                {addedStickers.map(({ path, size }, index) => (
                  <StickerImage
                    url={path}
                    size={size}
                    onDragStart={(e) => {
                      selSticker(index);
                      setStickerSize(addedStickers[index].size);
                    }}
                    onClick={(e) => {
                      selSticker(index);
                      setStickerSize(addedStickers[index].size);
                    }}
                  />
                ))}
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke="#df4b26"
                    strokeWidth={5}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                      line.tool === "eraser" ? "destination-out" : "source-over"
                    }
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchMaker;

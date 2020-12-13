// defining variables
// c and h are canvases, f and b are contexts
let c, h, f, b, img, mouseX = null,
    mouseY = null,
    array = [],
    startTime = 0,
    over500msElapsed = true

$("body").mousemove((e) => {
  mouseX = e.clientX
  mouseY = e.clientY
  startTime = Date.now()
  over500msElapsed || onImageLoad()
})

// handle mouse leaving window (set null) or resize (rebuild canvases)
$(window)
  .on("blur mouseout", function() {
  mouseX = mouseY = null
}).on("resize", function() {
  c && c.parentNode && c.parentNode.removeChild(c)
  setUpCanvases()
})

setUpCanvases()

function setUpCanvases() {
  const bodyWidth = $("body").width()
  const bodyHeight = $("body").height()
  c = document.createElement("canvas")
  c.width = bodyWidth
  c.height = bodyHeight
  c.style.position = "absolute"
  c.style.top = 0
  c.style.left = 0
  $("body").append(c)
  h = document.createElement("canvas")
  h.width = bodyWidth
  h.height = bodyHeight
  // set up contexts
  if (c.getContext && c.getContext("2d") && (f = c.getContext("2d"),
                                             b = h.getContext("2d"), b.lineCap = "round", b.shadowColor = "#000", !img)) {
    // loads image (never added to DOM) so that it can be added to canvas (browser only needs to download it once)
    img = new Image
    // add listener before setting source so it will definitely capture the event
    $(img).one("load", onImageLoad)
    $(img).attr("src", "https://static.canva.com/static/images/bg_tiles_color.2.jpg")
  }
}

function onImageLoad() {
  let currentTime = Date.now()
  over500msElapsed = currentTime > startTime + 500 ? false : true
  
  // push to start of array
  mouseX && over500msElapsed && array.unshift({
    time: currentTime,
    x: mouseX,
    y: mouseY + $("body").scrollTop()
  })
  
  // trims array - removes all items older than 1s
  for (let i = 0; i < array.length; i++) {
    if (currentTime - array[i].time > 1000) {
      array.length = i
    }
  }
  
  if (array.length > 0) {
    requestAnimationFrame(onImageLoad)
  }
  
  // clear canvas2 by its own width and height
  b.clearRect(0, 0, h.width, h.height)
  
  // loop through each item in array
  for (i = 1; i < array.length; i++) {
    const thisItem = array[i]
    const lastItem = array[i - 1]
    
    // fading stroke over time
    const lineOpacity = Math.max(1 - (currentTime - thisItem.time) / 1000, 0)
    b.strokeStyle = `rgba(0,0,0,${lineOpacity})`
    b.lineWidth = 80
    b.beginPath()
    b.moveTo(lastItem.x, lastItem.y)
    b.lineTo(thisItem.x, thisItem.y)
    b.stroke()
  }
  
  // adjusting for canvas ratio
  let imageRatio1 = c.width
  let imageRatio2 = c.width / img.naturalWidth *
    img.naturalHeight
  imageRatio2 < c.height && (imageRatio2 = c.height, imageRatio1 = c.height / img.naturalHeight * img.naturalWidth)
  
  // drawing the images
  // draw image onto f
  f.drawImage(img, 0, 0, imageRatio1, imageRatio2)
  // set "destination-in" temporarily: when f and h overlap, f is kept (h acts as a mask for the image)
  f.globalCompositeOperation = "destination-in"
  // add h as mask
  f.drawImage(h, 0, 0)
  // reset to normal composite operation
  f.globalCompositeOperation = "source-over"
}
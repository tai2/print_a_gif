;(function () {
  var dpi = 200
  var pageWidth = 8.268 * dpi // A4 portrait
  var pageHeight = 11.693 * dpi // A4 portrait
  var margin = 0.78 * dpi

  if (!window.File || !window.FileReader || !window.FileList) {
    alert('The File APIs are not fully supported in this browser.')
    return
  }

  jQuery.event.props.push('dataTransfer')

  $(window).on('drop', function (e) {
    var files = e.dataTransfer.files
    var reader = new FileReader()

    if (0 < files.length) {
      if (files[0].type.match('image/gif')) {
        reader.readAsBinaryString(files[0])
        e.stopPropagation()
        e.preventDefault()
      }
    }

    reader.onload = function (e) {
      var gif, previewImg

      previewImg = document.createElement('img')
      previewImg.title = files[0].name

      $('#preview').empty()
      $('#preview').append(previewImg)

      gif = new SuperGif({
        gif: previewImg,
        auto_play: 0,
      })
      gif.load(e.target.result, function () {
        generate(gif)
        gif.play()
        if (!$('#succeeeded').is(':visible')) {
          $('#description').fadeOut(function () {
            $('#succeeded').fadeIn()
          })
        }
      })

      $('.preference').unbind('change')
      $('.preference').on('change', function () {
        generate(gif)
      })
    }
  })
  $(window).on('dragover', function (e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })

  function generate(gif) {
    var i, j, k, frame, repeat
    var hMargin =
      $('#margin').val() === 'left' || $('#margin').val() === 'right'
        ? margin
        : 0
    var vMargin =
      $('#margin').val() === 'top' || $('#margin').val() === 'bottom'
        ? margin
        : 0
    var minWidth = 0.78 * dpi + hMargin
    var maxColumn = Math.floor(pageWidth / minWidth)
    var columnNum = Math.min(
      maxColumn,
      Math.max(1, parseInt($('#column_num').val(), 10))
    )
    var cellWidth = Math.floor(pageWidth / columnNum)
    var repeatNum = Math.min(
      100,
      Math.max(1, parseInt($('#repeat_num').val(), 10))
    )
    var rowNum = Math.floor(
      (gif.get_length() * repeatNum + columnNum - 1) / columnNum
    )
    var imageWidth = cellWidth - hMargin
    var imageHeight =
      (gif.get_canvas().height * imageWidth) / gif.get_canvas().width
    var cellHeight = imageHeight + vMargin
    var rowNumInPage = Math.floor(pageHeight / cellHeight)
    var pageNum = Math.floor((rowNum + rowNumInPage - 1) / rowNumInPage)
    var topMargin = $('#margin').val() === 'top' ? margin : 0
    var leftMargin = $('#margin').val() === 'left' ? margin : 0
    var pageCanvas, pageContext

    console.log('pageNum', pageNum)
    console.log('canvas size', pageWidth, pageHeight)
    console.log('image size', imageWidth, imageHeight)
    console.log('mergin size', hMargin, vMargin)

    $('#printable_area').empty()

    frame = 0
    repeat = 0
    for (i = 0; i < pageNum; i++) {
      pageCanvas = document.createElement('canvas')
      pageCanvas.className = 'page'
      pageCanvas.width = pageWidth
      pageCanvas.height = pageHeight
      pageContext = pageCanvas.getContext('2d')
      pageContext.fillStyle = '#000'
      pageContext.font = '20px sans-serif'

      for (j = 0; j < rowNumInPage; j++) {
        for (k = 0; k < columnNum; k++) {
          if (frame < gif.get_length()) {
            gif.move_to(frame)
            pageContext.drawImage(
              gif.get_canvas(),
              k * cellWidth + leftMargin,
              j * cellHeight + topMargin,
              imageWidth,
              imageHeight
            )
            pageContext.fillText(
              frame + 1,
              k * cellWidth + 10,
              j * cellHeight + 22
            )
            frame++
            if (frame == gif.get_length()) {
              repeat++
              if (repeat < repeatNum) {
                frame = 0
              }
            }
          }
        }
      }

      function dashedStroke() {
        pageContext.strokeStyle = '#fff'
        pageContext.setLineDash([])
        pageContext.stroke()
        pageContext.strokeStyle = '#555'
        pageContext.setLineDash([3, 12])
        pageContext.stroke()
      }
      pageContext.lineWidth = 2
      for (j = 1; j < rowNumInPage; j++) {
        pageContext.beginPath()
        pageContext.moveTo(0, j * cellHeight)
        pageContext.lineTo(pageWidth, j * cellHeight)
        pageContext.closePath()
        dashedStroke()
      }
      for (j = 1; j < columnNum; j++) {
        pageContext.beginPath()
        pageContext.moveTo(j * cellWidth, 0)
        pageContext.lineTo(j * cellWidth, pageHeight)
        pageContext.closePath()
        dashedStroke()
      }

      $('#printable_area').append(pageCanvas)
    }
  }
})()

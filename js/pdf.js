const url = '/paijian.pdf' //想要预览的pdf文件地址，可以相对路径也可以是绝对路径
var pdfDoc = null
var pageNum = 1
var pageRendering = false
var pageNumPending = null
const scale = 2 //调节预览文件的清晰度

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
	pageRendering = true;
	// Using promise to fetch the page
	pdfDoc.getPage(num).then(function(page) {
		var viewport = page.getViewport({
			scale
		});
		var canvas = document.getElementById('canvas')
		var ctx = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		// Render PDF page into canvas context
		var renderContext = {
			canvasContext: ctx,
			viewport: viewport
		};
		var renderTask = page.render(renderContext);

		// Wait for rendering to finish
		renderTask.promise.then(function() {
			pageRendering = false;
			if (pageNumPending !== null) {
				// New page rendering is pending
				renderPage(pageNumPending);
				pageNumPending = null;
			}
		});
	});

	// Update page counters
	document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
	if (pageRendering) {
		pageNumPending = num;
	} else {
		renderPage(num);
	}
}

/**
 * Displays previous page.
 */
function onPrevPage() {
	if (pageNum <= 1) {
		return;
	}
	pageNum--;
	queueRenderPage(pageNum);
}


/**
 * Displays next page.
 */
function onNextPage() {
	if (pageNum >= pdfDoc.numPages) {
		return;
	}
	pageNum++;
	queueRenderPage(pageNum);
}

/**
 * Displays first page.
 */
function onFirstPage() {
	if (pageNum <= 1) {
		return;
	}
	pageNum = 1;
	queueRenderPage(pageNum);
}

/**
 * Displays final page.
 */
function onFinalPage() {
	if (pageNum >= pdfDoc.numPages) {
		return;
	}
	pageNum = pdfDoc.numPages;
	queueRenderPage(pageNum);
}
/**
 * Asynchronously downloads PDF.
 */
let loadingTask = pdfjsLib.getDocument(url)
loadingTask.promise.then(function(pdfDoc_) {
	pdfDoc = pdfDoc_;
	document.getElementById('page_count').textContent = pdfDoc.numPages;

	// Initial/first page rendering
	renderPage(pageNum);
});
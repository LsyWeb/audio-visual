class AudioVisual {

  constructor(canvasId, audioId, barWidth = 0, barColor = 'cornflowerblue') {
    this.canvasElement = document.getElementById(canvasId); // canvas实例
    this.canvasCtx = this.canvasElement.getContext("2d"); // canvas画布
    this.canvasWidth = innerWidth * devicePixelRatio; // canvas宽度
    this.canvasHeight = (innerHeight / 2) * devicePixelRatio; // canvas高度
    this.audioElement = document.getElementById(audioId); // 音频元素
    this.barColor = barColor;  // 柱状颜色
  }

  connect() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.source = this.audioCtx.createMediaElementSource(this.audioElement);

    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

  }

  init() {
    this.isInit = true;
    console.log('init')
    this.connect();

    this.analyser.fftSize = 512;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.draw();

  }

  draw() {
    console.log('draw')
    if (this.pause) return;
    this.drawVisual = requestAnimationFrame(() => { this.draw() });
    this.analyser.getByteFrequencyData(this.dataArray);
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    let barHeight;
    const len = this.dataArray.length;
    let barWidth = this.canvasWidth / len / 5;

    this.canvasCtx.fillStyle = this.barColor;

    for (let i = 0; i < this.dataArray.length; i++) {
      const data = this.dataArray[i];
      barHeight = data / 255 * this.canvasHeight;

      const x1 = (i * barWidth) + 150;
      const x2 = 150 - (i + 1) * barWidth;

      const y = this.canvasHeight - barHeight;

      this.canvasCtx.fillRect(x1, y, barWidth - 1, barHeight);
      this.canvasCtx.fillRect(x2, y, barWidth - 1, barHeight);
    }
  }

  start() {
    if (!this.isInit) {
      this.init();
    } else {
      this.pause = false;
      this.draw();
    }

  }

  stop() {
    if (this.drawVisual) {
      cancelAnimationFrame(this.drawVisual)
      this.drawVisual = null;
      this.pause = true;
    }
  }

}

const audioTest = new AudioVisual('canvas', 'audio', 5);
audioTest.audioElement.onplay = () => {
  console.log('onplay');
  audioTest.start();
}
audioTest.audioElement.onpause = () => {
  audioTest.stop();
}
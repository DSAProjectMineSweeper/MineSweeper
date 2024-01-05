class SoundManager {
  constructor() {
      this.winSound = new Audio('assets/audio/win.mp3');
      this.loseSound = new Audio('assets/audio/lose.wav');
      this.bombSound = new Audio('assets/audio/bomb.mp3');
  }

  playWinSound() {
      this.winSound.play();
  }

  playLoseSound() {
      this.loseSound.play();
  }

  playBombSound() {
      this.bombSound.play();
  }
}


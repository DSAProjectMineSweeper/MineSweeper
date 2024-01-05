class Timer {
    constructor() {
        this.gTimeInterval = null;
    }

    startClock() {
        var elTimer = document.querySelector('.timer');
        this.gTimeInterval = setInterval(function () {
            game.gGame.secsPassed++;
            var timeArr = new Date(game.gGame.secsPassed * 1000).toString().split(':');
            var minutes = timeArr[1];
            var seconds = timeArr[2].split(' ')[0];
            elTimer.innerText = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopClock() {
        clearInterval(this.gTimeInterval);
        this.gTimeInterval = null;
    }

    setBestTime(levelSize) {
        var level = (levelSize === 4) ? 'besttimeeasy' : (levelSize === 8) ? 'besttimemedium' : 'besttimehard';
        var currGameTime = game.gGame.secsPassed;
    
        if (!localStorage[level] || currGameTime < +localStorage[level]) {
            localStorage.setItem(level, currGameTime);
            game.gLevel.bestTime = localStorage[level];
            this.renderBestTime();
        }
    }

    renderBestTime() {
        if (game.gLevel.bestTime < 60) gElBestTimeDisplay.innerText = `⏰record: ${game.gLevel.bestTime} secs`
        else if (game.gLevel.bestTime > 60) {
            var bestTimeMins = (game.gLevel.bestTime / 60).toFixed(2)
            gElBestTimeDisplay.innerText = `⏰record: ${bestTimeMins} mins`
        }
    }
}
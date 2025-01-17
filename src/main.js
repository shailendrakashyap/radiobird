import Pipe from './class/Pipe.js'
import Bird from './class/Bird.js'
import Ground from './class/Ground.js'
import Cloud from './class/Cloud.js'
import ScoreBoard from './class/ScoreBoard.js'

export const TOP = 0
export const BOTTOM = 1

const canvas = document.getElementById('canvas')
canvas.width = String(window.innerWidth)
canvas.height = String(window.innerHeight)
if (!localStorage.highest) localStorage.highest = 0

const Game = Class.extend({
  width: window.innerWidth,
  height: window.innerHeight,
  position: 0,
  score: 0,
  pipesHorizontalSpacing: () => {
    const normal = (200 * window.innerHeight) / window.innerWidth
    if (normal > 500) return 500
    else if (normal < 150) return 150
    else return normal
  },
  pipesVerticalSpacing: 180,
  states: { WAIT: 0, PLAYING: 1, GAME_OVER: 2 },

  init: function (options) {
    this.canvas = options.canvas
    this.context = this.canvas.getContext('2d')
    this.bird = new Bird(this)
    this.ground = new Ground(this)
    this.scoreboard = new ScoreBoard(this)
    this.clouds = [
      new Cloud(this, 100, 30, 0.1),
      new Cloud(this, 300, 60, 0.4),
      new Cloud(this, 500, 20, 0.4),
      new Cloud(this, 700, 30, 0.1)
    ]
    this.pipes = []
    this.passedPipes = []
    this.lastPipe = null
    this.state = this.states.WAIT
    this.canvas.addEventListener('click', this.onclick.bind(this))
    window.addEventListener('resize', () => {
      canvas.width = String(window.innerWidth)
      canvas.height = String(window.innerHeight)
      this.width = window.innerWidth
      this.height = window.innerHeight
    })
  },

  createPipe: function () {
    if (
      !this.lastPipe ||
      this.lastPipe.x < this.width - this.pipesHorizontalSpacing()
    ) {
      let positionX = this.width,
        pipeTop,
        pipeBottom,
        hTop,
        hBottom,
        order
      hTop = parseInt(Math.random() * (this.height / 2)) + 40
      hBottom = this.height - this.pipesVerticalSpacing - hTop
      pipeTop = new Pipe(this, TOP, positionX, hTop)
      pipeBottom = new Pipe(this, BOTTOM, positionX, hBottom)
      order = this.pipes.length + 1
      pipeTop.order = pipeBottom.order = order
      this.pipes.push(pipeTop)
      this.pipes.push(pipeBottom)
      this.lastPipe = pipeBottom
    }
  },

  handleCollision: function () {
    if (this.bird.y < -100 || this.bird.y > this.height + 100)
      this.state = this.states.GAME_OVER
    for (let pipe of this.pipes) {
      let collides =
        this.bird.x > pipe.x - pipe.width / 2 &&
        this.bird.x < pipe.x + pipe.width &&
        this.bird.y > pipe.y &&
        this.bird.y < pipe.y + pipe.height
      if (collides) this.state = this.states.GAME_OVER
    }
  },

  updateScore: function () {
    if (this.state == this.states.PLAYING)
      for (let pipe of this.pipes)
        if (this.bird.x > pipe.x + pipe.width)
          if (this.passedPipes.indexOf(pipe.order) == -1) {
            this.passedPipes.push(pipe.order)
            console.log(this.score)
            this.score++
            if (this.score > Number(localStorage.highest))
              localStorage.highest = this.score
          }
  },

  showGameOverScreen: function () {
    const size = 50
    this.context.fillStyle = '#000'
    this.context.textAlign = 'center'
    this.context.font = `bold ${size}px helvetica`

    const x = window.innerWidth / 2
    const y = window.innerWidth / 2
    this.context.fillText('GAME OVER', x, y - size)
    this.context.fillText('SCORE: ' + this.score, x, y)
    this.context.fillText('HIGHEST SCORE: ' + localStorage.highest, x, y + size)
  },

  update: function () {
    this.position += 1
    this.handleCollision()
    this.updateScore()
    this.ground.update()
    this.bird.update()
    this.scoreboard.update()
    this.createPipe()
    for (let cloud of this.clouds) cloud.update()
    for (let pipe of this.pipes) pipe.update()
  },

  draw: function () {
    this.clear()
    this.ground.draw()
    for (let cloud of this.clouds) cloud.draw()
    for (let pipe of this.pipes) pipe.draw()
    this.bird.draw()
    this.scoreboard.draw()
    if (this.state == this.states.GAME_OVER) {
      this.passedPipes = []
      this.showGameOverScreen()
    }
  },

  clear: function () {
    this.context.fillStyle = '#d9ffff'
    this.context.fillRect(0, 0, this.width, this.height)
  },

  onclick: function () {
    if (this.state == this.states.WAIT) this.state = this.states.PLAYING
    if (this.state == this.states.GAME_OVER) this.reset()
  },

  reset: function () {
    this.state = this.states.WAIT
    this.bird.reset()
    this.score = 0
    this.position = 0
    this.pipes = []
    this.lastPipe = null
  },

  loop: function () {
    this.update()
    this.draw()
    window.requestAnimationFrame
      ? window.requestAnimationFrame(this.loop.bind(this))
      : setTimeout(this.loop.bind(this), 1000 / 60)
  }
})

let game = new Game({ canvas })
game.loop()

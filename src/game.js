import { Container, Sprite, Text, TextStyle, Graphics } from "pixi.js";
import gsap from "gsap";
import { GAME_HEIGHT, GAME_WIDTH } from ".";

let boxArray = [];
let boxData = [
  [1, 1, 1, 1],
  [1, 0, 1, 0],
  [1, 1, 1, 0],
];

let words = {
  GOLD: {
    direction: "H",
    pos: [0, 0],
    inGrid: true,
    painted: false,
  },
  GOD: {
    direction: "V",
    pos: [0, 0],
    inGrid: true,
    painted: false,
  },
  DOG: {
    direction: "H",
    pos: [2, 0],
    inGrid: true,
    painted: false,
  },
  LOG: {
    direction: "V",
    pos: [0, 2],
    inGrid: true,
    painted: false,
  },
};

export default class Game extends Container {
  constructor(level = 0, onLevelComplete) {
    super();
    this.level = level;
    this.onLevelComplete = onLevelComplete;
    this.init();
    this.dragging = false;
    this.selectedLetters = [];
    this.lineGraphics = new Graphics();
    this.addChild(this.lineGraphics);
    this.currentHoveredLetter = null;
    this.formedWordContainer = new Container();
    this.addChild(this.formedWordContainer);
  }

  init() {
    this.createBackground();
    this.createWordGrid();
    this.createCircle();
    this.playNowButton();
  }

  createBackground() {
    let background = Sprite.from("background");
    background.anchor.set(0.5);
    background.scale.set(0.5);
    this.addChild(background);
    background.x = GAME_WIDTH * 0.5;
    background.y = GAME_HEIGHT * 0.5;
  }

  createWordGrid() {
    const gridContainer = new Container();
    const cellSize = 90;
    const gap = 6;
    boxData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          const cellSprite = Sprite.from("rect");
          cellSprite.tint = 0xFFF7E6;
          cellSprite.width = cellSize;
          cellSprite.height = cellSize;
          cellSprite.x = colIndex * (cellSize + gap);
          cellSprite.y = rowIndex * (cellSize + gap);
          gridContainer.addChild(cellSprite);

        

          boxArray.push({ cellSprite, rowIndex, colIndex });
        }
      });
    });
    gridContainer.x = (GAME_WIDTH - gridContainer.width) / 2;
    gridContainer.y = (GAME_HEIGHT - gridContainer.height) / 7;
    this.addChild(gridContainer);
  }

  /* getLetterAt(rowIndex, colIndex) {
    for (let word in words) {
      const wordData = words[word];
      const [startRow, startCol] = wordData.pos;
      const length = word.length;

      if (wordData.direction === "H" && rowIndex === startRow && colIndex >= startCol && colIndex < startCol + length) {
        return { letter: word[colIndex - startCol], word, index: colIndex - startCol };
      }

      if (wordData.direction === "V" && colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + length) {
        return { letter: word[rowIndex - startRow], word, index: rowIndex - startRow };
      }
    }
    return { letter: null, word: null, index: null };
  } 
  */
  shuffleLetters() {
    const letters = this.letterSprites.map(sprite => sprite.text);
    this.letterSprites.forEach(sprite => this.removeChild(sprite));
    this.letterSprites = [];
    this.shuffleArray(letters);
    this.createLetterSprites(letters);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  playNowButton() {
    const button = Sprite.from("play");
    button.anchor.set(0.5);
    button.scale.set(1);
    button.x = GAME_WIDTH * 0.5;
    button.y = GAME_HEIGHT * 0.88;
    this.addChild(button);

    const textStyle = new TextStyle({
      fontFamily: "Sniglet Regular",
      fontWeight: "bolder",
      fontSize: 23,
      align: "center",
      fill: "#ffffff"
    });
    const btnText = new Text("PLAY NOW!", textStyle);
    btnText.anchor.set(0.5);
    btnText.x = button.x;
    btnText.y = button.y;
    this.addChild(btnText);

    gsap.to(button, {
      pixi: {
        scale: 0.9,
      },
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut"
    });

    gsap.to(btnText, {
      pixi: {
        scale: 0.9,
      },
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut"
    });
  }


  createLetterSprites(letters, circle) {
    const radius = 70;
    const centerX = GAME_WIDTH * 0.5;
    const centerY = GAME_HEIGHT * 0.70;

    letters.forEach((letter, index) => {
      const angle = (index / letters.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const letterText = new Text(letter, new TextStyle({
        fontFamily: "Sniglet Regular",
        fontSize: 36,
        fill: "#FF9933",
        fontWeight: "bolder",
        align: "center",
      }));
      letterText.anchor.set(0.5);
      letterText.x = x;
      letterText.y = y;
      letterText.interactive = true;
      letterText.buttonMode = true;

      const letterCircle = new Graphics();
      letterCircle.beginFill(0xFF9933, 0);
      letterCircle.drawCircle(letterText.x, letterText.y, 25);
      letterCircle.endFill();
      this.addChild(letterCircle);

      letterText.on('pointerdown', (event) => this.onDragStart(event, letterText, letterCircle));
      letterText.on('pointerup', (event) => this.onDragEnd(event, letterText, letterCircle));
      letterText.on('pointerupoutside', (event) => this.onDragEnd(event, letterText, letterCircle));
      letterText.on('pointermove', (event) => this.onDragMove(event, letterText));

      this.addChild(letterText);
      this.letterSprites.push(letterText);
    });
}

  createCircle() {
    const circle = Sprite.from("circle");
    circle.anchor.set(0.5);
    circle.x = GAME_WIDTH * 0.5;
    circle.y = GAME_HEIGHT * 0.70;
    circle.scale.set(0.035);
    circle.tint = 0xFFF7E6;
    circle.alpha = 0.7;
    circle.name = "circle";
    this.addChild(circle);

    const shuffleIcon = Sprite.from("shuffle");
    shuffleIcon.anchor.set(0.5);
    shuffleIcon.x = GAME_WIDTH * 0.5;
    shuffleIcon.y = GAME_HEIGHT * 0.70;
    shuffleIcon.scale.set(0.06);
    shuffleIcon.interactive = true;
    shuffleIcon.buttonMode = true;
    shuffleIcon.on('pointerdown', this.shuffleLetters.bind(this));
    shuffleIcon.cursor = 'pointer';
    this.addChild(shuffleIcon);

    const letters = "GODL".split("");
    this.createLetterSprites(letters, circle);
    const radius = 70;
    const centerX = GAME_WIDTH * 0.5;
    const centerY = GAME_HEIGHT * 0.70;
    letters.forEach((letter, index) => {
      const angle = (index / letters.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const letterText = new Text(letter, new TextStyle({
        fontFamily: "Sniglet Regular",
        fontSize: 36,
        fill: "#FF9933",
        fontWeight: "bolder",
        align: "center",
      }));
      letterText.anchor.set(0.5);
      letterText.x = x;
      letterText.y = y;
      letterText.interactive = true;
      letterText.buttonMode = true;


      

      const letterCircle = new Graphics();
      letterCircle.beginFill(0xFF9933, 0);
      letterCircle.drawCircle(letterText.x, letterText.y, 25);
      letterCircle.endFill();
      this.addChild(letterCircle);

      letterText.on('pointerdown', (event) => this.onDragStart(event, letterText, letterCircle));
      letterText.on('pointerup', (event) => this.onDragEnd(event, letterText, letterCircle));
      letterText.on('pointerupoutside', (event) => this.onDragEnd(event, letterText, letterCircle));
      letterText.on('pointermove', (event) => this.onDragMove(event, letterText));

      this.addChild(letterText);
      this.letterSprites.push(letterText);

    });
  }

  onDragStart(event, letterText, letterCircle) {
    this.dragging = true;
    this.selectedLetters = [letterText];
    this.clearAllLetterCircles(); 
    letterText.style.fill = "#FFFFFF";
    this.updateFormedWordContainer(); // Update
    letterCircle.clear();
    letterCircle.beginFill(0xFF9933, 1);
    letterCircle.drawCircle(letterText.x, letterText.y, 25);
    this.addChild(letterCircle);
    this.addChild(letterText);
    this.lineGraphics.clear();
    this.lineGraphics.lineStyle(5, 0xFF9933, 1);
    this.lineGraphics.moveTo(letterText.x, letterText.y);
  }

  onDragMove(event, letterText) {
    if (this.dragging) {
      const newPosition = event.data.getLocalPosition(this);
      this.lineGraphics.clear();
      this.lineGraphics.lineStyle(5, 0xFF9933, 1);

      this.lineGraphics.moveTo(this.selectedLetters[0].x, this.selectedLetters[0].y);

      for (let selectedLetter of this.selectedLetters) {
        this.lineGraphics.lineTo(selectedLetter.x, selectedLetter.y);
      }

      let hoveredLetter = null;
      this.children.forEach((child) => {
        if (child instanceof Text && !this.selectedLetters.includes(child) && child.containsPoint(newPosition)) {
          hoveredLetter = child;
        }
      });

      if (hoveredLetter) {
        this.selectedLetters.push(hoveredLetter);
        this.lineGraphics.lineTo(hoveredLetter.x, hoveredLetter.y);
        hoveredLetter.style.fill = "#FFFFFF";
        this.updateFormedWordContainer(); // Update

        let letterCircle = new Graphics();
        letterText.style.fill = "#FFFFFF";
        letterCircle.beginFill(0xFF9933, 1);
        letterCircle.drawCircle(hoveredLetter.x, hoveredLetter.y, 25);
        letterCircle.endFill();
        this.addChild(letterCircle);
        this.addChild(letterText);

      } else {
        this.lineGraphics.lineTo(newPosition.x, newPosition.y);
      }
    }
  }

  onDragEnd(event, letterText, letterCircle) {
    this.dragging = false;
    this.selectedLetters.forEach(letter => {
      letter.style.fill = "#FF9933";
    });
    this.clearAllLetterCircles();
    this.checkWord();
    this.lineGraphics.clear();
    this.selectedLetters = [];
    this.currentHoveredLetter = null;
    this.clearFormedWordContainer(); // Clear the old container

    
  }

  clearAllLetterCircles() {
    this.children.forEach((child) => {
      if (child instanceof Graphics) {
        child.clear();
      }
    });
  }

  checkWord() {
    let formedWord = this.selectedLetters.map(letter => letter.text).join('');
    if (formedWord) { //if formedWord is not empty
      if (words.hasOwnProperty(formedWord)) {
        console.log(`Valid word: ${formedWord}`);
        this.colorWordCells(formedWord); // Color the matching cells
        words[formedWord].painted = true; // Mark the word as painted
        if (this.isEnd()) { // Check if all words are found
          this.endGame();
        }
      } else {
        console.log(`Invalid word: ${formedWord}`);
      }
    }
  }

  colorWordCells(word) {
    const wordData = words[word];
    const [startRow, startCol] = wordData.pos;
    const direction = wordData.direction;
    const length = word.length;

    if (wordData.painted) return; 

    for (let i = 0; i < length; i++) {
      let rowIndex = startRow;
      let colIndex = startCol;
      if (direction === "H") {
        colIndex += i;
      } else if (direction === "V") {
        rowIndex += i;
      }

      boxArray.forEach(({ cellSprite, rowIndex: r, colIndex: c }) => {
        if (r === rowIndex && c === colIndex) {
          cellSprite.tint = 0xFF9933;

        
            /* this.children.forEach((child) => {
            if (child instanceof Text && child.x === cellSprite.x + cellSprite.width / 2 && child.y === cellSprite.y + cellSprite.height / 2) {
              this.removeChild(child);
            }
          }); */

          const letterText = new Text(word[i], new TextStyle({
            fontFamily: "Sniglet Regular",
            fontSize: 36,
            fill: 0xFFF7E6,
            fontWeight: "bolder",
            align: "center",
          }));
          letterText.anchor.set(0.5);
          letterText.x = cellSprite.x + cellSprite.width + 5;
          letterText.y = cellSprite.y + cellSprite.height + 30;
          this.addChild(letterText);
        }
      });
    }
  }

  updateFormedWordContainer() {

    

    this.formedWordContainer.removeChildren();
    let formedWord = this.selectedLetters.map(letter => letter.text).join('');
    const letters = formedWord.split('');
    const letterSpacing = 45;
    let xOffset = (GAME_WIDTH - (letters.length * letterSpacing - letterSpacing)) / 2;

    

    letters.forEach((letter, index) => {

      const letterBg = Sprite.from("rect");
      letterBg.anchor.set(0.5);
      letterBg.x = xOffset + index * letterSpacing;
      letterBg.y = GAME_HEIGHT * 0.5;
      letterBg.scale.set(0.18);
      letterBg.tint = 0xFF9933;
      this.formedWordContainer.addChild(letterBg);

      const letterText = new Text(letter, new TextStyle({
        fontFamily: "Sniglet Regular",
        fontSize: 32,
        fill: 0xFFF7E6,
        fontWeight: "bolder",
        align: "center",
      }));
      letterText.anchor.set(0.5);
      letterText.x = xOffset + index * letterSpacing;
      letterText.y = GAME_HEIGHT * 0.5;
      this.formedWordContainer.addChild(letterText);
    });
  }

  clearFormedWordContainer() {
    this.formedWordContainer.removeChildren();
  }


  isEnd() {
    return Object.values(words).every(word => word.painted);
  }

  endGame() {
    this.removeChildren();

    const endScreen = new Graphics();
    endScreen.beginFill(0x000000, 0.7);
    endScreen.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    endScreen.endFill();
    this.addChild(endScreen);

    const button = Sprite.from("play");
    button.anchor.set(0.5);
    button.scale.set(1);
    button.x = GAME_WIDTH * 0.5;
    button.y = GAME_HEIGHT * 0.5;
    this.addChild(button);

    const textStyle = new TextStyle({
      fontFamily: "Sniglet Regular",
      fontWeight: "bolder",
      fontSize: 23,
      align: "center",
      fill: "#ffffff"
    });
    const btnText = new Text("REFRESH", textStyle);
    btnText.anchor.set(0.5);
    btnText.x = button.x;
    btnText.y = button.y;
    this.addChild(btnText);

    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', () => {
      location.reload(); 
    });

    gsap.to(button, {
      pixi: {
        scale: 0.9,
      },
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut"
    });

    gsap.to(btnText, {
      pixi: {
        scale: 0.9,
      },
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut"
    });
  }
}




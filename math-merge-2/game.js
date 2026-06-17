// game.js - Hero Tower Math Merge Main Logic

// ==================== 1. CONSTANTS & GAME DATA ====================

// ヒーロースキンの定義
const SKINS = [
  { id: 'warrior', name: '新米戦士', icon: '⚡', cost: 0, color: 'var(--neon-blue)' },
  { id: 'knight', name: '鉄壁のナイト', icon: '🛡️', cost: 500, color: '#00ffcc' },
  { id: 'mage', name: '魔導の使い手', icon: '🔮', cost: 1200, color: '#e500ff' },
  { id: 'hero', name: '不死鳥の勇者', icon: '👑', cost: 3000, color: 'var(--neon-gold)' },
  { id: 'dragon', name: '混沌のドラゴン', icon: '🐉', cost: 8000, color: '#ff3c00' }
];

// 実績の定義
const ACHIEVEMENTS = [
  { id: 'clear_5', title: '駆け出しの勇者', desc: 'ステージ5をクリアする', target: 5, type: 'stage', reward: 200 },
  { id: 'clear_20', title: 'タワーマスター', desc: '全ステージ(20)をクリアする', target: 20, type: 'stage', reward: 1000 },
  { id: 'gold_1000', title: 'ゴールドコレクター', desc: '累計ゴールド1000獲得', target: 1000, type: 'gold', reward: 300 },
  { id: 'power_500', title: '圧倒的パワー', desc: 'ゲーム中に戦闘力500以上に達する', target: 500, type: 'power', reward: 400 },
  { id: 'power_5000', title: '神の領域', desc: 'ゲーム中に戦闘力5000以上に達する', target: 5000, type: 'power', reward: 1500 },
  { id: 'defeat_100', title: 'モンスターハンター', desc: '敵を累計100体倒す', target: 100, type: 'defeat', reward: 500 },
  { id: 'endless_50', title: '無限の挑戦者', desc: 'エンドレスモードで50階以上に到達する', target: 50, type: 'endless', reward: 800 }
];

// ステージ定義 (全20ステージ)
// type: 'hero' (プレイヤー), 'enemy' (敵), 'boss' (大ボス), 'item_add' (加算), 'item_mul' (乗算), 'item_sub' (減算), 'princess' (ゴール/姫), 'chest' (宝箱)
const STAGES = [
  // Stage 1
  {
    towers: [
      { floors: [{ type: 'hero', val: 10 }, { type: 'enemy', val: 5 }] },
      { floors: [{ type: 'enemy', val: 12 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 2
  {
    towers: [
      { floors: [{ type: 'hero', val: 12 }, { type: 'item_add', val: 8 }] },
      { floors: [{ type: 'enemy', val: 15 }, { type: 'enemy', val: 28 }, { type: 'chest', val: 100 }] }
    ]
  },
  // Stage 3
  {
    towers: [
      { floors: [{ type: 'hero', val: 8 }, { type: 'enemy', val: 6 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'enemy', val: 22 }, { type: 'enemy', val: 15 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 4 (計算の選択)
  {
    towers: [
      { floors: [{ type: 'hero', val: 15 }, { type: 'item_sub', val: 5 }] },
      { floors: [{ type: 'enemy', val: 8 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 25 }, { type: 'boss', val: 50 }, { type: 'chest', val: 150 }] }
    ]
  },
  // Stage 5
  {
    towers: [
      { floors: [{ type: 'hero', val: 10 }, { type: 'item_add', val: 15 }, { type: 'enemy', val: 20 }] },
      { floors: [{ type: 'enemy', val: 12 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 70 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 6
  {
    towers: [
      { floors: [{ type: 'hero', val: 20 }, { type: 'item_sub', val: 10 }, { type: 'enemy', val: 8 }] },
      { floors: [{ type: 'enemy', val: 15 }, { type: 'item_mul', val: 2 }, { type: 'enemy', val: 32 }] },
      { floors: [{ type: 'boss', val: 80 }, { type: 'chest', val: 200 }] }
    ]
  },
  // Stage 7 (トラップ回避)
  {
    towers: [
      { floors: [{ type: 'hero', val: 12 }, { type: 'item_add', val: 18 }, { type: 'item_sub', val: 15 }] },
      { floors: [{ type: 'enemy', val: 25 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 70 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 8
  {
    towers: [
      { floors: [{ type: 'hero', val: 15 }, { type: 'enemy', val: 10 }, { type: 'item_add', val: 25 }] },
      { floors: [{ type: 'enemy', val: 40 }, { type: 'item_mul', val: 2 }, { type: 'enemy', val: 95 }] },
      { floors: [{ type: 'boss', val: 170 }, { type: 'chest', val: 250 }] }
    ]
  },
  // Stage 9
  {
    towers: [
      { floors: [{ type: 'hero', val: 25 }, { type: 'item_sub', val: 10 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 35 }, { type: 'enemy', val: 60 }, { type: 'item_add', val: 50 }] },
      { floors: [{ type: 'boss', val: 180 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 10
  {
    towers: [
      { floors: [{ type: 'hero', val: 30 }, { type: 'enemy', val: 20 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'enemy', val: 80 }, { type: 'item_sub', val: 30 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'boss', val: 300 }, { type: 'chest', val: 400 }] }
    ]
  },
  // Stage 11
  {
    towers: [
      { floors: [{ type: 'hero', val: 10 }, { type: 'item_mul', val: 5 }, { type: 'enemy', val: 45 }] },
      { floors: [{ type: 'enemy', val: 90 }, { type: 'item_add', val: 100 }, { type: 'enemy', val: 180 }] },
      { floors: [{ type: 'boss', val: 350 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 12
  {
    towers: [
      { floors: [{ type: 'hero', val: 50 }, { type: 'item_sub', val: 25 }, { type: 'enemy', val: 20 }] },
      { floors: [{ type: 'enemy', val: 40 }, { type: 'item_mul', val: 2 }, { type: 'enemy', val: 150 }] },
      { floors: [{ type: 'enemy', val: 100 }, { type: 'item_mul', val: 3 }, { type: 'boss', val: 600 }, { type: 'chest', val: 500 }] }
    ]
  },
  // Stage 13 (パズル要素強め)
  {
    towers: [
      { floors: [{ type: 'hero', val: 15 }, { type: 'item_add', val: 10 }] },
      { floors: [{ type: 'enemy', val: 22 }, { type: 'item_mul', val: 4 }] },
      { floors: [{ type: 'enemy', val: 95 }, { type: 'item_sub', val: 50 }, { type: 'boss', val: 180 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 14
  {
    towers: [
      { floors: [{ type: 'hero', val: 40 }, { type: 'enemy', val: 30 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'enemy', val: 120 }, { type: 'item_sub', val: 60 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 250 }, { type: 'boss', val: 800 }, { type: 'chest', val: 600 }] }
    ]
  },
  // Stage 15
  {
    towers: [
      { floors: [{ type: 'hero', val: 30 }, { type: 'item_mul', val: 10 }, { type: 'item_sub', val: 100 }] },
      { floors: [{ type: 'enemy', val: 150 }, { type: 'enemy', val: 300 }, { type: 'item_add', val: 200 }] },
      { floors: [{ type: 'boss', val: 900 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 16
  {
    towers: [
      { floors: [{ type: 'hero', val: 80 }, { type: 'item_sub', val: 40 }, { type: 'enemy', val: 35 }] },
      { floors: [{ type: 'enemy', val: 70 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 220 }, { type: 'item_sub', val: 100 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'boss', val: 800 }, { type: 'chest', val: 800 }] }
    ]
  },
  // Stage 17
  {
    towers: [
      { floors: [{ type: 'hero', val: 50 }, { type: 'item_add', val: 50 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'enemy', val: 180 }, { type: 'item_mul', val: 3 }] },
      { floors: [{ type: 'enemy', val: 500 }, { type: 'boss', val: 1600 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 18
  {
    towers: [
      { floors: [{ type: 'hero', val: 100 }, { type: 'item_sub', val: 50 }, { type: 'enemy', val: 40 }] },
      { floors: [{ type: 'enemy', val: 80 }, { type: 'item_mul', val: 5 }, { type: 'item_sub', val: 200 }] },
      { floors: [{ type: 'enemy', val: 250 }, { type: 'boss', val: 1100 }, { type: 'chest', val: 1000 }] }
    ]
  },
  // Stage 19
  {
    towers: [
      { floors: [{ type: 'hero', val: 60 }, { type: 'item_mul', val: 2 }, { type: 'item_add', val: 80 }] },
      { floors: [{ type: 'enemy', val: 190 }, { type: 'item_mul', val: 3 }, { type: 'item_sub', val: 300 }] },
      { floors: [{ type: 'enemy', val: 400 }, { type: 'boss', val: 1500 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 20 (ラストステージ)
  {
    towers: [
      { floors: [{ type: 'hero', val: 100 }, { type: 'item_sub', val: 80 }, { type: 'item_mul', val: 10 }] },
      { floors: [{ type: 'enemy', val: 150 }, { type: 'item_mul', val: 3 }, { type: 'enemy', val: 500 }] },
      { floors: [{ type: 'enemy', val: 1000 }, { type: 'item_sub', val: 500 }, { type: 'item_mul', val: 2 }] },
      { floors: [{ type: 'boss', val: 4000 }, { type: 'chest', val: 2000 }] }
    ]
  }
];

// ==================== 2. STATE VARIABLES ====================

let gameState = {
  gold: 0,
  currentStage: 0,          // 0-indexed (Stage 1 is index 0)
  unlockedStage: 0,         // どこまでアンロックされているか
  unlockedSkins: ['warrior'], // アンロック済みのスキン
  selectedSkin: 'warrior',  // 現在選択されているスキン
  upgrades: {
    atk: 0,                 // レベル
    gold: 0                 // レベル
  },
  stats: {
    totalGold: 0,
    totalDefeats: 0,
    maxPowerReached: 0,
    maxEndlessHeight: 0
  },
  claimedAchievements: []   // 獲得済みの実績ID
};

// プレイ中のゲームデータ
let activeGame = {
  mode: 'stages',           // 'stages' or 'endless'
  heroPower: 0,             // 現在のヒーローの数値
  endlessHeight: 0,         // エンドレスモードでのクリアした高さ（タワー数）
  goldEarnedThisRun: 0,     // このプレイで獲得したゴールド
  activeLevelData: null,    // 現在生成されているタワー情報
  heroPosition: { towerIdx: 0, floorIdx: 0 },
  maxPowerThisRun: 0
};

// ドラッグ＆ドロップ用の一時データ
let dragData = {
  entityEl: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  heroPower: 0,
  currentHoverRoom: null
};

// ==================== 3. BACKGROUND CANVAS PARTICLES ====================

const initBackgroundParticles = () => {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  const particles = [];
  const particleCount = 40;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.5 + 0.1,
      fadeSpeed: Math.random() * 0.005 + 0.002,
      color: Math.random() > 0.5 ? '#00e5ff' : '#bd00ff'
    });
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    
    // 深いグラデーション背景の補助描画（CSSグラデーションがベースですが、Canvasでネオン粒子をブレンド）
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
      
      p.x += p.speedX;
      p.y += p.speedY;
      
      // 画面上部から出たら下部から戻す
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10 || p.x > width + 10) {
        p.speedX *= -1;
      }
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// ==================== 4. SOUND CONTROLLER EVENT BRIDGE ====================

const setupSoundButton = () => {
  const btn = document.getElementById('btn-sound-toggle');
  
  btn.addEventListener('click', () => {
    const isMuted = window.sounds.toggleMute();
    btn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    if (!isMuted) {
      // BGM再生
      window.sounds.playBgm();
    }
  });
  
  // ユーザーの最初の操作でBGM再生（ブラウザの自動再生ポリシー対策）
  const playBgmOnFirstInteract = () => {
    if (!window.sounds.isMuted) {
      window.sounds.playBgm();
    }
    document.removeEventListener('click', playBgmOnFirstInteract);
    document.removeEventListener('touchstart', playBgmOnFirstInteract);
  };
  document.addEventListener('click', playBgmOnFirstInteract);
  document.addEventListener('touchstart', playBgmOnFirstInteract);
};

// ==================== 5. LOCAL STORAGE SAVE / LOAD ====================

const saveGame = () => {
  localStorage.setItem('hero_tower_quest_state', JSON.stringify(gameState));
};

const loadGame = () => {
  const saved = localStorage.getItem('hero_tower_quest_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 深いコピーで初期データとの互換性を保つ
      gameState = {
        ...gameState,
        ...parsed,
        upgrades: { ...gameState.upgrades, ...parsed.upgrades },
        stats: { ...gameState.stats, ...parsed.stats }
      };
      
      // 配列の復元
      if (parsed.unlockedSkins) gameState.unlockedSkins = parsed.unlockedSkins;
      if (parsed.claimedAchievements) gameState.claimedAchievements = parsed.claimedAchievements;
    } catch (e) {
      console.error('Save data corrupt, resetting', e);
    }
  }
  updateGlobalCurrencyDisplays();
};

const updateGlobalCurrencyDisplays = () => {
  const goldText = gameState.gold.toLocaleString();
  document.getElementById('home-gold-val').innerText = goldText;
  document.getElementById('stages-gold-val').innerText = goldText;
  document.getElementById('game-gold-val').innerText = goldText;
  document.getElementById('shop-gold-val').innerText = goldText;
  document.getElementById('achievements-gold-val').innerText = goldText;
  
  // ホーム画面のヒーロー情報更新
  const skin = SKINS.find(s => s.id === gameState.selectedSkin) || SKINS[0];
  const homeHeroPreview = document.getElementById('home-hero-preview');
  const homeHeroSprite = homeHeroPreview.querySelector('.hero-character-sprite');
  const homeHeroAtkVal = document.getElementById('home-hero-atk');
  
  homeHeroSprite.innerText = skin.icon;
  homeHeroPreview.style.borderColor = skin.color;
  homeHeroPreview.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px ${skin.color}aa`;
  
  const startingPower = 10 + gameState.upgrades.atk * 5;
  homeHeroAtkVal.innerText = startingPower;
};

// ==================== 6. SCREEN NAVIGATION ====================

const navigateTo = (screenId) => {
  const transition = document.getElementById('screen-transition');
  transition.classList.add('active');
  window.sounds.playSelect();
  
  setTimeout(() => {
    // 全ての画面を非アクティブに
    document.querySelectorAll('.screen').forEach(scr => scr.classList.remove('active'));
    
    // 対象の画面をアクティブに
    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.add('active');
    
    // 必要な動的読み込み
    if (screenId === 'screen-stages') {
      renderStageSelect();
    } else if (screenId === 'screen-shop') {
      renderShop();
    } else if (screenId === 'screen-achievements') {
      renderAchievements();
    } else if (screenId === 'screen-home') {
      updateGlobalCurrencyDisplays();
    }
    
    setTimeout(() => {
      transition.classList.remove('active');
    }, 150);
  }, 150);
};

const setupNavigation = () => {
  document.getElementById('btn-start-stages').addEventListener('click', () => navigateTo('screen-stages'));
  document.getElementById('btn-start-endless').addEventListener('click', () => startEndlessGame());
  
  document.getElementById('btn-open-shop').addEventListener('click', () => navigateTo('screen-shop'));
  document.getElementById('btn-open-achievements').addEventListener('click', () => navigateTo('screen-achievements'));
  
  document.getElementById('btn-stages-back').addEventListener('click', () => navigateTo('screen-home'));
  document.getElementById('btn-shop-back').addEventListener('click', () => navigateTo('screen-home'));
  document.getElementById('btn-achievements-back').addEventListener('click', () => navigateTo('screen-home'));
  
  document.getElementById('btn-game-back').addEventListener('click', () => {
    // プレイ中なら確認ダイアログを出さずにポータルへ（カジュアルゲームのため即戻る）
    window.location.href = '../index.html';
  });
  
  document.getElementById('btn-game-reset').addEventListener('click', () => {
    window.sounds.playSelect();
    if (activeGame.mode === 'stages') {
      startStage(activeGame.activeStageIdx);
    } else {
      startEndlessGame();
    }
  });
  
  // モーダルアクション
  document.getElementById('btn-win-next').addEventListener('click', () => {
    document.getElementById('overlay-win').classList.remove('active');
    const nextStage = activeGame.activeStageIdx + 1;
    if (nextStage < STAGES.length) {
      startStage(nextStage);
    } else {
      navigateTo('screen-stages');
    }
  });
  
  document.getElementById('btn-win-home').addEventListener('click', () => {
    document.getElementById('overlay-win').classList.remove('active');
    window.location.href = '../index.html';
  });
  
  document.getElementById('btn-lose-retry').addEventListener('click', () => {
    document.getElementById('overlay-lose').classList.remove('active');
    if (activeGame.mode === 'stages') {
      startStage(activeGame.activeStageIdx);
    } else {
      startEndlessGame();
    }
  });
  
  document.getElementById('btn-lose-home').addEventListener('click', () => {
    document.getElementById('overlay-lose').classList.remove('active');
    window.location.href = '../index.html';
  });
  
  // ポータルへ戻るボタンの登録
  const btnPortal = document.getElementById('btn-back-to-portal');
  if (btnPortal) {
    btnPortal.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
};

// ==================== 7. STAGE SELECT RENDERING ====================

const renderStageSelect = () => {
  const container = document.getElementById('stages-container');
  container.innerHTML = '';
  
  STAGES.forEach((stage, idx) => {
    const card = document.createElement('div');
    card.classList.add('stage-card');
    
    const isUnlocked = idx <= gameState.unlockedStage;
    const isCompleted = idx < gameState.unlockedStage;
    
    if (isCompleted) {
      card.classList.add('unlocked', 'completed');
      card.innerHTML = `<span>${idx + 1}</span>`;
      card.addEventListener('click', () => startStage(idx));
    } else if (isUnlocked) {
      card.classList.add('unlocked');
      card.innerHTML = `<span>${idx + 1}</span>`;
      card.addEventListener('click', () => startStage(idx));
    } else {
      card.classList.add('locked');
      card.innerHTML = '<i class="fas fa-lock"></i>';
    }
    
    container.appendChild(card);
  });
  
  updateGlobalCurrencyDisplays();
};

// ==================== 8. GAMEPLAY LOGIC & GENERATION ====================

// ディープコピー関数
const cloneObject = (obj) => JSON.parse(JSON.stringify(obj));

// ステージ開始
const startStage = (stageIdx) => {
  activeGame.mode = 'stages';
  activeGame.activeStageIdx = stageIdx;
  activeGame.goldEarnedThisRun = 0;
  
  // レベルデータのロード
  const levelData = cloneObject(STAGES[stageIdx]);
  activeGame.activeLevelData = levelData;
  
  // ステージデータからヒーローの基本数値を読み込む（無い場合はデフォルト10）
  let basePower = 10;
  levelData.towers.forEach(tower => {
    tower.floors.forEach(floor => {
      if (floor.type === 'hero') {
        basePower = floor.val || 10;
      }
    });
  });
  
  // 初期パワー ＝ ステージ固有の基本値 ＋ アップグレード分
  const startingPower = basePower + gameState.upgrades.atk * 5;
  activeGame.heroPower = startingPower;
  activeGame.maxPowerThisRun = startingPower;
  
  // UIタイトル
  document.getElementById('game-level-title').innerText = `STAGE ${stageIdx + 1}`;
  document.querySelector('.endless-height-info').classList.add('hide');
  
  generateTowerUI(levelData);
  navigateTo('screen-game');
};

// エンドレスモード開始
const startEndlessGame = () => {
  activeGame.mode = 'endless';
  activeGame.endlessHeight = 0;
  activeGame.goldEarnedThisRun = 0;
  
  const startingPower = 10 + gameState.upgrades.atk * 5;
  activeGame.heroPower = startingPower;
  activeGame.maxPowerThisRun = startingPower;
  
  // エンドレス用の初期タワー生成
  generateNextEndlessTower();
  
  document.getElementById('game-level-title').innerText = 'ENDLESS';
  const heightInfo = document.querySelector('.endless-height-info');
  heightInfo.classList.remove('hide');
  document.getElementById('endless-height-val').innerText = activeGame.endlessHeight;
  
  navigateTo('screen-game');
};

// エンドレスの次のタワーを自動生成
const generateNextEndlessTower = () => {
  // 高さに応じた敵の強さスケーリング
  const h = activeGame.endlessHeight;
  
  // ヒーローの現在パワーを基準にパズルを自動生成
  const basePower = activeGame.heroPower;
  
  // 3本のタワーを生成する
  // タワー0: ヒーローが配置される
  // タワー1: 敵やバフアイテム
  // タワー2: ボス、宝箱、または次のゲート
  const levelData = {
    towers: [
      { floors: [{ type: 'hero', val: basePower }] },
      { floors: [] },
      { floors: [] }
    ]
  };
  
  // タワー1の設計
  // 2〜3フロア
  const tower1Floors = Math.random() > 0.5 ? 3 : 2;
  let runningPower = basePower;
  
  for (let i = 0; i < tower1Floors; i++) {
    // 50%でバフアイテム、50%で敵
    if (Math.random() > 0.5) {
      // バフ
      const isMul = Math.random() > 0.7;
      if (isMul) {
        const mulVal = Math.random() > 0.8 ? 3 : 2;
        levelData.towers[1].floors.push({ type: 'item_mul', val: mulVal });
        runningPower *= mulVal;
      } else {
        const addVal = Math.round((Math.random() * 15 + 5) * (1 + h * 0.1));
        levelData.towers[1].floors.push({ type: 'item_add', val: addVal });
        runningPower += addVal;
      }
    } else {
      // 敵 (倒せる強さ)
      const enemyVal = Math.round(Math.max(1, runningPower * (Math.random() * 0.6 + 0.2)));
      levelData.towers[1].floors.push({ type: 'enemy', val: enemyVal });
      runningPower += enemyVal;
    }
  }
  
  // タワー2の設計
  // 2〜3フロア。最後に強敵ボスか、宝箱
  const tower2Floors = Math.random() > 0.5 ? 3 : 2;
  for (let i = 0; i < tower2Floors - 1; i++) {
    // 障害物または敵
    const isTrap = Math.random() > 0.7;
    if (isTrap) {
      const subVal = Math.round(runningPower * 0.25);
      levelData.towers[2].floors.push({ type: 'item_sub', val: subVal });
      runningPower = Math.max(1, runningPower - subVal);
    } else {
      const enemyVal = Math.round(Math.max(1, runningPower * (Math.random() * 0.5 + 0.2)));
      levelData.towers[2].floors.push({ type: 'enemy', val: enemyVal });
      runningPower += enemyVal;
    }
  }
  
  // 最上階にボスと宝箱/姫
  const bossVal = Math.round(runningPower * (Math.random() * 0.4 + 0.8)); // ギリギリ倒せるか倒せないかの強さ
  levelData.towers[2].floors.push({ type: 'boss', val: bossVal });
  
  // 宝箱も追加
  levelData.towers[2].floors.push({ type: 'chest', val: Math.round(50 * (1 + h * 0.2)) });
  
  activeGame.activeLevelData = levelData;
  generateTowerUI(levelData);
};

// タワーUIのDOM生成
const generateTowerUI = (levelData) => {
  const container = document.getElementById('towers-wrapper');
  container.innerHTML = '';
  
  // タワーを並べる
  levelData.towers.forEach((towerData, tIdx) => {
    const towerEl = document.createElement('div');
    towerEl.classList.add('tower');
    towerEl.dataset.towerIdx = tIdx;
    
    // 各階（部屋）を生成 (逆順で並べるため、CSSで flex-direction: column-reverse している)
    // したがって、配列の[0]が1階になり、下から積み上がる
    towerData.floors.forEach((floorData, fIdx) => {
      const roomEl = document.createElement('div');
      roomEl.classList.add('room');
      roomEl.dataset.towerIdx = tIdx;
      roomEl.dataset.floorIdx = fIdx;
      
      if (floorData.type !== 'empty') {
        const entityEl = createEntityDOM(floorData, tIdx, fIdx);
        roomEl.appendChild(entityEl);
        
        // ヒーローの位置を保存
        if (floorData.type === 'hero') {
          activeGame.heroPosition = { towerIdx: tIdx, floorIdx: fIdx };
        }
      }
      
      towerEl.appendChild(roomEl);
    });
    
    container.appendChild(towerEl);
  });
  
  // スケーリングの調整（タワーが高すぎる場合に画面に収める）
  adjustViewportScale();
  setupDragAndDrop();
};

// ビューポートサイズに応じたタワーの自動縮小
const adjustViewportScale = () => {
  const wrapper = document.getElementById('towers-wrapper');
  const viewport = document.querySelector('.gameplay-viewport');
  
  // 初期リセット
  wrapper.style.transform = 'scale(1)';
  
  const viewportHeight = viewport.clientHeight;
  const wrapperHeight = wrapper.scrollHeight;
  const viewportWidth = viewport.clientWidth;
  const wrapperWidth = wrapper.scrollWidth;
  
  let scale = 1;
  
  if (wrapperHeight > viewportHeight - 20) {
    scale = (viewportHeight - 20) / wrapperHeight;
  }
  
  if (wrapperWidth * scale > viewportWidth - 20) {
    scale = (viewportWidth - 20) / wrapperWidth;
  }
  
  // 最小スケール制限
  scale = Math.max(0.65, Math.min(1.1, scale));
  wrapper.style.transform = `scale(${scale})`;
};

// エンティティDOMの作成
const createEntityDOM = (data, tIdx, fIdx) => {
  const el = document.createElement('div');
  el.classList.add('entity');
  el.dataset.towerIdx = tIdx;
  el.dataset.floorIdx = fIdx;
  
  const iconEl = document.createElement('span');
  iconEl.classList.add('entity-icon');
  
  const valEl = document.createElement('span');
  valEl.classList.add('entity-val');
  
  // データに応じた見た目の切り替え
  switch (data.type) {
    case 'hero':
      el.classList.add('entity-hero');
      el.id = 'hero-character';
      const skin = SKINS.find(s => s.id === gameState.selectedSkin) || SKINS[0];
      iconEl.innerText = skin.icon;
      el.style.borderColor = skin.color;
      el.style.boxShadow = `0 0 12px ${skin.color}aa, inset 0 0 8px ${skin.color}55`;
      valEl.innerText = activeGame.heroPower;
      break;
      
    case 'enemy':
      el.classList.add('entity-enemy');
      iconEl.innerText = getEnemyIcon(data.val);
      valEl.innerText = data.val;
      break;
      
    case 'boss':
      el.classList.add('entity-boss');
      iconEl.innerText = '👹'; // ボスのアイコン
      valEl.innerText = data.val;
      break;
      
    case 'item_add':
      el.classList.add('entity-item');
      iconEl.innerText = '🗡️'; // 剣のアイコン
      valEl.innerText = `+${data.val}`;
      break;
      
    case 'item_mul':
      el.classList.add('entity-item', 'entity-item-multiply');
      iconEl.innerText = '🔮'; // 魔法の書
      valEl.innerText = `x${data.val}`;
      break;
      
    case 'item_sub':
      el.classList.add('entity-enemy'); // トラップは赤色ネオン
      iconEl.innerText = '⚙️'; // トラップの歯車
      valEl.innerText = `-${data.val}`;
      break;
      
    case 'princess':
      el.classList.add('entity-princess');
      iconEl.innerText = '👸'; // お姫様
      valEl.innerText = '';
      break;
      
    case 'chest':
      el.classList.add('entity-princess'); // ゴールドも中身はゴール扱いで光らせる
      iconEl.innerText = '🎁'; // 宝箱
      valEl.innerText = '';
      break;
  }
  
  el.appendChild(iconEl);
  el.appendChild(valEl);
  return el;
};

// 敵の強さに応じた絵文字の自動切り替え
const getEnemyIcon = (val) => {
  if (val < 15) return '💀';      // スケルトン
  if (val < 40) return 'Goblin';  // ゴブリン(実際は絵文字👺/🧟)
  if (val < 100) return '🧟';     // ゾンビ
  if (val < 250) return '🐺';     // ワーウルフ
  return '🧛';                    // ヴァンパイア
};

// ==================== 9. DRAG & DROP & TOUCH INTERACTION ====================

// クリック移動用の一時データ
let clickSelectState = {
  isHeroSelected: false,
  heroEl: null,
  towerIdx: -1,
  floorIdx: -1
};

const setupDragAndDrop = () => {
  const wrapper = document.getElementById('towers-wrapper');
  if (!wrapper) return;
  
  // イベントデリゲーションを使用し、動的生成されたヒーローや部屋に対応する
  // ヒーローのドラッグ開始イベント
  wrapper.addEventListener('mousedown', handlePointerDown);
  wrapper.addEventListener('touchstart', handlePointerDown, { passive: false });
  
  // 部屋のクリック（タップ）イベント（クリック選択移動用）
  wrapper.addEventListener('click', handleRoomClick);
};

// ヒーローまたは部屋のタップ/クリック検出
const handlePointerDown = (e) => {
  const heroEl = e.target.closest('.entity-hero');
  if (!heroEl) return;
  
  window.sounds.playSelect();
  
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
  
  const rect = heroEl.getBoundingClientRect();
  const appContainer = document.querySelector('.app-container');
  
  dragData.isDragging = true;
  dragData.entityEl = heroEl;
  dragData.heroPower = activeGame.heroPower;
  dragData.startX = clientX;
  dragData.startY = clientY;
  dragData.offsetX = clientX - rect.left;
  dragData.offsetY = clientY - rect.top;
  
  // ドラッグ元のヒーローは半透明にする
  heroEl.style.opacity = '0.4';
  
  // app-containerの直下にゴースト要素を作成して追従させる（ズレ防止）
  const ghost = heroEl.cloneNode(true);
  ghost.id = 'hero-drag-ghost';
  ghost.classList.add('dragging');
  ghost.style.position = 'absolute';
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.zIndex = '1000';
  ghost.style.pointerEvents = 'none';
  
  appContainer.appendChild(ghost);
  dragData.ghostEl = ghost;
  
  updateGhostPosition(clientX, clientY);
  
  if (e.type === 'touchstart') {
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  } else {
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  }
  
  e.preventDefault();
};

const handlePointerMove = (e) => {
  if (!dragData.isDragging) return;
  
  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
  
  updateGhostPosition(clientX, clientY);
  
  // 指やマウスの下にある部屋の検出
  const element = document.elementFromPoint(clientX, clientY);
  const roomEl = element ? element.closest('.room') : null;
  
  if (roomEl) {
    if (dragData.currentHoverRoom !== roomEl) {
      clearRoomHovers();
      dragData.currentHoverRoom = roomEl;
      
      const tIdx = parseInt(roomEl.dataset.towerIdx);
      const fIdx = parseInt(roomEl.dataset.floorIdx);
      const floorData = activeGame.activeLevelData.towers[tIdx].floors[fIdx];
      
      if (isValidMove(tIdx, fIdx, floorData)) {
        roomEl.classList.add('droppable-hover');
      } else {
        roomEl.classList.add('invalid-hover');
      }
    }
  } else {
    clearRoomHovers();
    dragData.currentHoverRoom = null;
  }
  
  e.preventDefault();
};

const updateGhostPosition = (clientX, clientY) => {
  const ghost = dragData.ghostEl;
  if (!ghost) return;
  
  const appContainer = document.querySelector('.app-container');
  const appRect = appContainer.getBoundingClientRect();
  
  // スケーリングを考慮した座標計算
  const x = clientX - appRect.left - dragData.offsetX;
  const y = clientY - appRect.top - dragData.offsetY;
  
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
};

const handlePointerUp = (e) => {
  if (!dragData.isDragging) return;
  dragData.isDragging = false;
  
  // ゴーストの削除
  if (dragData.ghostEl) {
    dragData.ghostEl.remove();
    dragData.ghostEl = null;
  }
  
  // 元のヒーローの透明度を戻す
  if (dragData.entityEl) {
    dragData.entityEl.style.opacity = '';
  }
  
  const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
  const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
  
  // ドラッグ移動距離が非常に短い場合は「クリック（タップ）」とみなす
  const dist = Math.hypot(clientX - dragData.startX, clientY - dragData.startY);
  
  // イベント解除
  document.removeEventListener('mousemove', handlePointerMove);
  document.removeEventListener('mouseup', handlePointerUp);
  document.removeEventListener('touchmove', handlePointerMove);
  document.removeEventListener('touchend', handlePointerUp);
  
  const roomEl = dragData.currentHoverRoom;
  clearRoomHovers();
  dragData.currentHoverRoom = null;
  
  if (dist < 8) {
    // クリック（タップ）判定：ヒーローの選択トグル
    toggleHeroSelection(dragData.entityEl);
    return;
  }
  
  if (roomEl) {
    const tIdx = parseInt(roomEl.dataset.towerIdx);
    const fIdx = parseInt(roomEl.dataset.floorIdx);
    const floorData = activeGame.activeLevelData.towers[tIdx].floors[fIdx];
    
    if (isValidMove(tIdx, fIdx, floorData)) {
      // 選択状態を解除して移動
      clearHeroSelection();
      executeMove(tIdx, fIdx);
      return;
    }
  }
  
  // キャンセル時は再描画で元に戻す
  generateTowerUI(activeGame.activeLevelData);
};

// クリック移動用の部屋クリック処理
const handleRoomClick = (e) => {
  if (!clickSelectState.isHeroSelected) return;
  
  const roomEl = e.target.closest('.room');
  if (!roomEl) {
    // 部屋以外をクリックした場合は選択解除
    clearHeroSelection();
    return;
  }
  
  const tIdx = parseInt(roomEl.dataset.towerIdx);
  const fIdx = parseInt(roomEl.dataset.floorIdx);
  const floorData = activeGame.activeLevelData.towers[tIdx].floors[fIdx];
  
  // ヒーロー自身をクリックした場合はトグルまたは無視
  if (tIdx === clickSelectState.towerIdx && fIdx === clickSelectState.floorIdx) {
    clearHeroSelection();
    return;
  }
  
  if (isValidMove(tIdx, fIdx, floorData)) {
    clearHeroSelection();
    executeMove(tIdx, fIdx);
  } else {
    // 無効な部屋なら選択解除
    clearHeroSelection();
  }
};

// ヒーロー選択の切り替え
const toggleHeroSelection = (heroEl) => {
  if (clickSelectState.isHeroSelected) {
    clearHeroSelection();
  } else {
    clickSelectState.isHeroSelected = true;
    clickSelectState.heroEl = heroEl;
    clickSelectState.towerIdx = activeGame.heroPosition.towerIdx;
    clickSelectState.floorIdx = activeGame.heroPosition.floorIdx;
    
    // ヒーロー要素に選択スタイルを付与
    heroEl.classList.add('selected-hero-active');
    
    // 移動可能な部屋をハイライト
    highlightValidMoves();
  }
};

// ヒーロー選択の解除
const clearHeroSelection = () => {
  clickSelectState.isHeroSelected = false;
  if (clickSelectState.heroEl) {
    clickSelectState.heroEl.classList.remove('selected-hero-active');
    clickSelectState.heroEl = null;
  }
  clickSelectState.towerIdx = -1;
  clickSelectState.floorIdx = -1;
  
  // ハイライト消去
  document.querySelectorAll('.room').forEach(r => {
    r.classList.remove('valid-target-highlight');
  });
};

// 移動可能な部屋をすべてハイライト
const highlightValidMoves = () => {
  document.querySelectorAll('.room').forEach(roomEl => {
    const tIdx = parseInt(roomEl.dataset.towerIdx);
    const fIdx = parseInt(roomEl.dataset.floorIdx);
    const floorData = activeGame.activeLevelData.towers[tIdx].floors[fIdx];
    
    if (isValidMove(tIdx, fIdx, floorData)) {
      roomEl.classList.add('valid-target-highlight');
    }
  });
};

const clearRoomHovers = () => {
  document.querySelectorAll('.room').forEach(r => {
    r.classList.remove('droppable-hover', 'invalid-hover');
  });
};

// 移動可能かどうかのバリデーション
const isValidMove = (targetTowerIdx, targetFloorIdx, floorData) => {
  // ヒーロー自身がいる部屋には移動できない
  if (targetTowerIdx === activeGame.heroPosition.towerIdx && targetFloorIdx === activeGame.heroPosition.floorIdx) {
    return false;
  }
  
  // 部屋が空っぽ、もしくはクリア済みの部屋には移動できない（意味がないため）
  if (!floorData || floorData.type === 'empty' || floorData.type === 'hero') {
    return false;
  }
  
  // ルール: 対象の部屋より下にある全ての部屋が「empty（クリア済み）」または「ヒーローがいる部屋（自身の元の位置）」である必要がある
  const tower = activeGame.activeLevelData.towers[targetTowerIdx];
  for (let i = 0; i < targetFloorIdx; i++) {
    const type = tower.floors[i].type;
    if (type !== 'empty' && type !== 'hero') {
      return false; // 下の階に未クリアのものがあるため、まだ登れない
    }
  }
  
  return true;
};

// ==================== 10. COMBAT & RESOLUTION ====================

const executeMove = (targetTowerIdx, targetFloorIdx) => {
  const levelData = activeGame.activeLevelData;
  const targetFloor = levelData.towers[targetTowerIdx].floors[targetFloorIdx];
  const sourceTowerIdx = activeGame.heroPosition.towerIdx;
  const sourceFloorIdx = activeGame.heroPosition.floorIdx;
  
  const roomEl = document.querySelector(`.room[data-tower-idx="${targetTowerIdx}"][data-floor-idx="${targetFloorIdx}"]`);
  const heroRoomEl = document.querySelector(`.room[data-tower-idx="${sourceTowerIdx}"][data-floor-idx="${sourceFloorIdx}"]`);
  
  // アニメーション方向（ヒーローが右へ行くか左へ行くか）
  const directionClass = targetTowerIdx >= sourceTowerIdx ? 'combat-attack-right' : 'combat-attack-left';
  
  // ヒーローの元の位置を空にする
  levelData.towers[sourceTowerIdx].floors[sourceFloorIdx] = { type: 'empty' };
  
  // ヒーローをターゲットの部屋に移動
  levelData.towers[targetTowerIdx].floors[targetFloorIdx] = { type: 'hero' };
  activeGame.heroPosition = { towerIdx: targetTowerIdx, floorIdx: targetFloorIdx };
  
  // 描画を一度更新し、戦闘アニメーション用の要素を作る
  generateTowerUI(levelData);
  
  const heroEl = document.getElementById('hero-character');
  
  // アニメーション適用
  heroEl.classList.add(directionClass);
  window.sounds.playAttack();
  
  // ヒット時の処理
  setTimeout(() => {
    // 画面揺れとヒットエフェクト
    document.querySelector('.gameplay-viewport').classList.add('shake');
    roomEl.classList.add('flash-clear');
    
    // 計算処理
    let powerChangeText = '';
    let powerChangeType = '';
    let isGameOver = false;
    let isStageClear = false;
    let goldEarned = 0;
    
    const initialPower = activeGame.heroPower;
    
    switch (targetFloor.type) {
      case 'enemy':
      case 'boss':
        if (activeGame.heroPower >= targetFloor.val) {
          // 勝利！敵の数値を吸収する
          activeGame.heroPower += targetFloor.val;
          powerChangeText = `+${targetFloor.val}`;
          powerChangeType = 'float-add';
          gameState.stats.totalDefeats++;
          
          // ゴールド獲得
          let enemyGold = Math.round(targetFloor.val * 0.5);
          if (targetFloor.type === 'boss') enemyGold = targetFloor.val * 2;
          goldEarned = applyGoldBonus(enemyGold);
        } else {
          // 敗北！ゲームオーバー
          isGameOver = true;
        }
        break;
        
      case 'item_add':
        activeGame.heroPower += targetFloor.val;
        powerChangeText = `+${targetFloor.val}`;
        powerChangeType = 'float-add';
        window.sounds.playUpgrade();
        break;
        
      case 'item_mul':
        activeGame.heroPower *= targetFloor.val;
        powerChangeText = `x${targetFloor.val}`;
        powerChangeType = 'float-mult';
        window.sounds.playUpgrade();
        break;
        
      case 'item_sub':
        activeGame.heroPower -= targetFloor.val;
        powerChangeText = `-${targetFloor.val}`;
        powerChangeType = 'float-sub';
        if (activeGame.heroPower <= 0) {
          activeGame.heroPower = 0;
          isGameOver = true;
        }
        break;
        
      case 'princess':
        isStageClear = true;
        break;
        
      case 'chest':
        isStageClear = true;
        goldEarned = applyGoldBonus(targetFloor.val);
        break;
    }
    
    // 最高戦闘力の更新
    if (activeGame.heroPower > activeGame.maxPowerThisRun) {
      activeGame.maxPowerThisRun = activeGame.heroPower;
    }
    if (activeGame.heroPower > gameState.stats.maxPowerReached) {
      gameState.stats.maxPowerReached = activeGame.heroPower;
    }
    
    // ゴールド追加
    if (goldEarned > 0) {
      activeGame.goldEarnedThisRun += goldEarned;
      gameState.gold += goldEarned;
      gameState.stats.totalGold += goldEarned;
      saveGame();
      updateGlobalCurrencyDisplays();
    }
    
    // フローティングテキストの生成
    if (powerChangeText) {
      createFloatingText(roomEl, powerChangeText, powerChangeType);
    }
    
    // UI反映（ヒーロー数値更新）
    if (heroEl) {
      const valEl = heroEl.querySelector('.entity-val');
      if (valEl) valEl.innerText = activeGame.heroPower;
    }
    
    setTimeout(() => {
      document.querySelector('.gameplay-viewport').classList.remove('shake');
      roomEl.classList.remove('flash-clear');
      
      // ゲームオーバー判定
      if (isGameOver) {
        handleGameOver();
      } else if (isStageClear) {
        handleStageClear();
      } else {
        // 残りの敵がいるか確認（もし全てemptyで、ゴールが存在しないステージの場合は全滅でクリア）
        checkAutoClearCondition();
      }
    }, 200);
    
  }, 200);
};

// ゴールドボーナスの適用計算
const applyGoldBonus = (baseGold) => {
  const bonusPercent = gameState.upgrades.gold * 15;
  return Math.round(baseGold * (1 + bonusPercent / 100));
};

// フローティングテキスト生成
const createFloatingText = (parentEl, text, className) => {
  const floatEl = document.createElement('div');
  floatEl.classList.add('floating-num', className);
  floatEl.innerText = text;
  
  // 部屋の中央付近に配置
  floatEl.style.left = '50%';
  floatEl.style.top = '50%';
  
  parentEl.appendChild(floatEl);
  
  // アニメーション後に消去
  setTimeout(() => {
    floatEl.remove();
  }, 800);
};

// 自動クリア判定（姫や宝箱がおらず、敵が全滅した場合）
const checkAutoClearCondition = () => {
  const levelData = activeGame.activeLevelData;
  let hasTargets = false;
  
  levelData.towers.forEach(tower => {
    tower.floors.forEach(floor => {
      if (floor.type === 'enemy' || floor.type === 'boss' || floor.type === 'princess' || floor.type === 'chest') {
        hasTargets = true;
      }
    });
  });
  
  if (!hasTargets) {
    // 全てクリアした
    handleStageClear();
  }
};

// ステージクリア処理
const handleStageClear = () => {
  window.sounds.playWin();
  
  if (activeGame.mode === 'stages') {
    // ステージモードの場合
    const currentIdx = activeGame.activeStageIdx;
    
    // ステージクリア実績などの計算用
    if (currentIdx === gameState.unlockedStage) {
      gameState.unlockedStage++;
    }
    
    // ステージクリア基本報酬ゴールド
    const baseReward = (currentIdx + 1) * 30;
    const actualReward = applyGoldBonus(baseReward);
    
    // 合算
    activeGame.goldEarnedThisRun += actualReward;
    gameState.gold += actualReward;
    gameState.stats.totalGold += actualReward;
    
    saveGame();
    
    // リザルト画面表示
    const winOverlay = document.getElementById('overlay-win');
    document.getElementById('win-gold-earned').innerText = activeGame.goldEarnedThisRun;
    
    // ゴールドボーナス詳細
    const bonusRow = document.getElementById('win-bonus-row');
    const bonusVal = gameState.upgrades.gold * 15;
    if (bonusVal > 0) {
      bonusRow.classList.remove('hide');
      document.getElementById('win-gold-bonus').innerText = Math.round(activeGame.goldEarnedThisRun * (bonusVal / (100 + bonusVal)));
    } else {
      bonusRow.classList.add('hide');
    }
    
    winOverlay.classList.add('active');
    
    // 実績のチェック
    checkAchievements();
  } else {
    // エンドレスモードの場合、次のタワーへ進む
    activeGame.endlessHeight++;
    document.getElementById('endless-height-val').innerText = activeGame.endlessHeight;
    
    if (activeGame.endlessHeight > gameState.stats.maxEndlessHeight) {
      gameState.stats.maxEndlessHeight = activeGame.endlessHeight;
    }
    
    // パーティクル紙吹雪などの演出の代わりに、簡単な画面フラッシュ
    const viewport = document.querySelector('.gameplay-viewport');
    viewport.style.backgroundColor = 'rgba(0, 229, 255, 0.08)';
    setTimeout(() => {
      viewport.style.backgroundColor = '';
    }, 300);
    
    // 難易度を上げて次のタワーを生成
    generateNextEndlessTower();
    saveGame();
    
    checkAchievements();
  }
};

// ゲームオーバー処理
const handleGameOver = () => {
  window.sounds.playLose();
  
  const loseOverlay = document.getElementById('overlay-lose');
  const endlessStats = document.getElementById('lose-endless-stats');
  
  if (activeGame.mode === 'endless') {
    endlessStats.classList.remove('hide');
    document.getElementById('lose-endless-height').innerText = activeGame.endlessHeight;
    document.getElementById('lose-endless-gold').innerText = activeGame.goldEarnedThisRun;
  } else {
    endlessStats.classList.add('hide');
  }
  
  loseOverlay.classList.add('active');
  
  // 途中までの実績チェック
  checkAchievements();
};

// ==================== 11. UPGRADE SHOP LOGIC ====================

const renderShop = () => {
  updateGlobalCurrencyDisplays();
  
  // 1. 能力値の表示とボタン
  const atkLevel = gameState.upgrades.atk;
  const goldLevel = gameState.upgrades.gold;
  
  document.getElementById('val-level-atk').innerText = atkLevel + 1;
  document.getElementById('val-curr-atk').innerText = atkLevel * 5;
  
  document.getElementById('val-level-gold').innerText = goldLevel + 1;
  document.getElementById('val-curr-gold').innerText = goldLevel * 15;
  
  // コスト計算
  const atkCost = Math.round(100 * Math.pow(1.5, atkLevel));
  const goldCost = Math.round(150 * Math.pow(1.6, goldLevel));
  
  const btnAtk = document.getElementById('btn-upgrade-atk');
  const btnGold = document.getElementById('btn-upgrade-gold');
  
  document.getElementById('cost-upgrade-atk').innerText = atkCost;
  document.getElementById('cost-upgrade-gold').innerText = goldCost;
  
  btnAtk.disabled = gameState.gold < atkCost;
  btnGold.disabled = gameState.gold < goldCost;
  
  // イベントの再登録を防ぐためにクローンして置換
  const newBtnAtk = btnAtk.cloneNode(true);
  btnAtk.parentNode.replaceChild(newBtnAtk, btnAtk);
  newBtnAtk.addEventListener('click', () => {
    if (gameState.gold >= atkCost) {
      gameState.gold -= atkCost;
      gameState.upgrades.atk++;
      window.sounds.playUpgrade();
      saveGame();
      renderShop();
    }
  });
  
  const newBtnGold = btnGold.cloneNode(true);
  btnGold.parentNode.replaceChild(newBtnGold, btnGold);
  newBtnGold.addEventListener('click', () => {
    if (gameState.gold >= goldCost) {
      gameState.gold -= goldCost;
      gameState.upgrades.gold++;
      window.sounds.playUpgrade();
      saveGame();
      renderShop();
    }
  });
  
  // 2. スキン一覧の描画
  const skinsContainer = document.getElementById('skins-container');
  skinsContainer.innerHTML = '';
  
  SKINS.forEach(skin => {
    const card = document.createElement('div');
    card.classList.add('skin-card');
    if (gameState.selectedSkin === skin.id) {
      card.classList.add('selected');
    }
    
    const isOwned = gameState.unlockedSkins.includes(skin.id);
    const isEquipped = gameState.selectedSkin === skin.id;
    
    let badgeHTML = '';
    if (isEquipped) {
      badgeHTML = '<span class="skin-badge-selected">装備中</span>';
    }
    
    let actionBtnHTML = '';
    if (isEquipped) {
      actionBtnHTML = '<button class="btn-skin-buy owned" disabled>選択中</button>';
    } else if (isOwned) {
      actionBtnHTML = `<button class="btn-skin-buy owned btn-select-skin" data-id="${skin.id}">装備する</button>`;
    } else {
      const canBuy = gameState.gold >= skin.cost;
      const disabledClass = canBuy ? 'buyable' : 'locked';
      const disabledAttr = canBuy ? '' : 'disabled';
      actionBtnHTML = `<button class="btn-skin-buy ${disabledClass} btn-buy-skin" data-id="${skin.id}" data-cost="${skin.cost}" ${disabledAttr}>${skin.cost} <i class="fas fa-coins"></i></button>`;
    }
    
    card.innerHTML = `
      ${badgeHTML}
      <div class="skin-sprite" style="color: ${skin.color}; text-shadow: 0 0 10px ${skin.color}aa">${skin.icon}</div>
      <div class="skin-name">${skin.name}</div>
      ${actionBtnHTML}
    `;
    
    skinsContainer.appendChild(card);
  });
  
  // スキン購入イベント
  document.querySelectorAll('.btn-buy-skin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const cost = parseInt(btn.dataset.cost);
      if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.unlockedSkins.push(id);
        gameState.selectedSkin = id;
        window.sounds.playUpgrade();
        saveGame();
        renderShop();
      }
    });
  });
  
  // スキン選択イベント
  document.querySelectorAll('.btn-select-skin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      gameState.selectedSkin = id;
      window.sounds.playSelect();
      saveGame();
      renderShop();
    });
  });
};

// ==================== 12. ACHIEVEMENTS LOGIC ====================

const renderAchievements = () => {
  updateGlobalCurrencyDisplays();
  
  const container = document.getElementById('achievements-container');
  container.innerHTML = '';
  
  ACHIEVEMENTS.forEach(ach => {
    const card = document.createElement('div');
    card.classList.add('achievement-card');
    
    // 進捗値の取得
    let currentVal = 0;
    switch (ach.type) {
      case 'stage':
        currentVal = gameState.unlockedStage;
        break;
      case 'gold':
        currentVal = gameState.stats.totalGold;
        break;
      case 'power':
        currentVal = gameState.stats.maxPowerReached;
        break;
      case 'defeat':
        currentVal = gameState.stats.totalDefeats;
        break;
      case 'endless':
        currentVal = gameState.stats.maxEndlessHeight;
        break;
    }
    
    const isCompleted = currentVal >= ach.target;
    const isClaimed = gameState.claimedAchievements.includes(ach.id);
    
    if (isCompleted) {
      card.classList.add('completed');
    }
    
    // 進捗率
    const progressPercent = Math.min(100, Math.round((currentVal / ach.target) * 100));
    
    let statusBadgeHTML = '';
    if (isClaimed) {
      statusBadgeHTML = '<span class="achievement-status-badge claimed">獲得済み</span>';
    } else if (isCompleted) {
      statusBadgeHTML = `<span class="achievement-status-badge claimable btn-claim-ach" data-id="${ach.id}" data-reward="${ach.reward}">報酬を受取</span>`;
    } else {
      statusBadgeHTML = '<span class="achievement-status-badge locked">進行中</span>';
    }
    
    card.innerHTML = `
      <div class="achievement-icon-wrapper">
        <i class="${isCompleted ? 'fas fa-trophy' : 'fas fa-lock'}"></i>
      </div>
      <div class="achievement-details">
        <span class="achievement-title">${ach.title}</span>
        <span class="achievement-desc">${ach.desc}</span>
        <span class="achievement-reward">報酬: ${ach.reward}G</span>
        <div class="achievement-progress-bar">
          <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <span style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${currentVal.toLocaleString()} / ${ach.target.toLocaleString()}</span>
      </div>
      ${statusBadgeHTML}
    `;
    
    container.appendChild(card);
  });
  
  // 報酬受取イベント
  document.querySelectorAll('.btn-claim-ach').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const reward = parseInt(btn.dataset.reward);
      
      gameState.gold += reward;
      gameState.claimedAchievements.push(id);
      window.sounds.playUpgrade();
      saveGame();
      renderAchievements();
    });
  });
};

// 実績チェック（バックグラウンド通知）
const checkAchievements = () => {
  let hasNew = false;
  
  ACHIEVEMENTS.forEach(ach => {
    let currentVal = 0;
    switch (ach.type) {
      case 'stage': currentVal = gameState.unlockedStage; break;
      case 'gold': currentVal = gameState.stats.totalGold; break;
      case 'power': currentVal = gameState.stats.maxPowerReached; break;
      case 'defeat': currentVal = gameState.stats.totalDefeats; break;
      case 'endless': currentVal = gameState.stats.maxEndlessHeight; break;
    }
    
    const isCompleted = currentVal >= ach.target;
    const isClaimed = gameState.claimedAchievements.includes(ach.id);
    
    // 未受け取りの完了実績があるか
    if (isCompleted && !isClaimed) {
      hasNew = true;
    }
  });
  
  // 実績ボタンにバッジを表示
  const btnAch = document.getElementById('btn-open-achievements');
  if (hasNew) {
    btnAch.classList.add('text-neon-pink');
    btnAch.style.borderColor = 'var(--neon-pink)';
  } else {
    btnAch.classList.remove('text-neon-pink');
    btnAch.style.borderColor = '';
  }
};

// ==================== 13. INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', () => {
  // 1. 背景の起動
  initBackgroundParticles();
  
  // 2. 音声ボタンのブリッジ
  setupSoundButton();
  
  // 3. データロード
  loadGame();
  
  // 4. ナビゲーションの有効化
  setupNavigation();
  
  // 5. バックグラウンド実績の初期チェック
  checkAchievements();
});

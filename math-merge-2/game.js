// game.js - Hero Tower Math Merge Main Logic

// ==================== 1. CONSTANTS & GAME DATA ====================

// 主人公クラス（職業）の定義
const CLASSES = {
  warrior: {
    id: 'warrior',
    name: '戦士',
    icon: '⚔️',
    desc: '初期攻撃力が高めの、王道物理アタッカー。',
    baseAtk: 15
  },
  mage: {
    id: 'mage',
    name: '魔導士',
    icon: '🔮',
    desc: '乗算(x)アイテムの効果が+1強化される魔法の探求者。',
    baseAtk: 8
  },
  rogue: {
    id: 'rogue',
    name: '冒険者',
    icon: '🏹',
    desc: '獲得ゴールドが常に+20%される俊敏な義賊。',
    baseAtk: 10
  }
};

// クラスリスト（ループ用）
const CLASS_LIST = ['warrior', 'mage', 'rogue'];

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

// 進化段階の定義
const getDynamicHeroClass = (classId, power) => {
  if (classId === 'warrior') {
    if (power >= 1000) return { name: 'ゴッドウォリアー', icon: '👑', color: 'var(--neon-gold)' };
    if (power >= 200) return { name: 'ジェネラル', icon: '🔱', color: '#ff3c00' };
    if (power >= 50) return { name: 'ナイト', icon: '🛡️', color: '#00e5ff' };
    return { name: '戦士', icon: '⚔️', color: 'var(--neon-blue)' };
  } else if (classId === 'mage') {
    if (power >= 1000) return { name: 'ソーサラーキング', icon: '👑', color: 'var(--neon-gold)' };
    if (power >= 200) return { name: '大賢者', icon: '🌌', color: '#bd00ff' };
    if (power >= 50) return { name: 'ウィザード', icon: '🧙‍♂️', color: '#e500ff' };
    return { name: '魔導士', icon: '🔮', color: '#c4a9ff' };
  } else { // rogue
    if (power >= 1000) return { name: 'ロイヤルシーフ', icon: '👑', color: 'var(--neon-gold)' };
    if (power >= 200) return { name: 'シャドウハーフ', icon: '👺', color: '#ff007f' };
    if (power >= 50) return { name: 'アサシン', icon: '🗡️', color: '#ff5c00' };
    return { name: '冒険者', icon: '🏹', color: '#a29db5' };
  }
};

// ※ STAGES 定義は game.js の下部に新ステージ定義として一括で上書きします。

// ==================== 2. STATE VARIABLES ====================

let gameState = {
  gold: 0,
  currentStage: 0,          // 0-indexed (Stage 1 is index 0)
  unlockedStage: 0,         // どこまでアンロックされているか
  unlockedSkins: ['warrior'], // アンロック済みのスキン
  selectedSkin: 'warrior',  // 現在選択されているスキン (互換用)
  selectedClass: 'warrior', // 現在選択されているクラス (warrior, mage, rogue)
  currentHeroPower: 0,      // 前ステージクリア時の引き継ぎパワー (0の場合は初期値)
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
  shield: 0,                // 現在のシールド値
  keys: 0,                  // 現在の所持鍵数
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
  
  // クラスのデータ整合性チェックとフォールバック
  if (!gameState.selectedClass || !CLASS_LIST.includes(gameState.selectedClass)) {
    gameState.selectedClass = 'warrior';
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
  
  // ホーム画面のヒーロー情報（クラス選択）の更新
  const classId = gameState.selectedClass || 'warrior';
  const currentClass = CLASSES[classId];
  
  const homeHeroPreview = document.getElementById('home-hero-preview');
  const homeHeroClass = document.getElementById('home-hero-class');
  const homeHeroSprite = homeHeroPreview.querySelector('.hero-character-sprite');
  const homeHeroAtkVal = document.getElementById('home-hero-atk');
  const classDescText = document.getElementById('class-desc-text');
  
  // 初期攻撃力 ＝ クラス基本値 ＋ アップグレード分
  const baseAtk = currentClass.baseAtk + gameState.upgrades.atk * 5;
  // 引き継ぎパワーがある場合はそれを優先表示
  const displayPower = (gameState.currentHeroPower > 0) ? gameState.currentHeroPower : baseAtk;
  
  if (homeHeroClass) homeHeroClass.innerText = currentClass.name;
  if (homeHeroSprite) homeHeroSprite.innerText = currentClass.icon;
  if (homeHeroAtkVal) homeHeroAtkVal.innerText = displayPower;
  if (classDescText) classDescText.innerText = currentClass.desc;
  
  // クラスのテーマカラーに応じたボーダーや影の設定
  const classVisual = getDynamicHeroClass(classId, displayPower);
  homeHeroPreview.style.borderColor = classVisual.color;
  homeHeroPreview.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px ${classVisual.color}aa`;
  
  // プレイ中画面のシールドと鍵数の表示更新
  const shieldValEl = document.getElementById('game-shield-val');
  const keysValEl = document.getElementById('game-keys-val');
  if (shieldValEl) shieldValEl.innerText = activeGame.shield;
  if (keysValEl) keysValEl.innerText = activeGame.keys;
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

  // クラス切り替え処理
  const btnPrev = document.getElementById('btn-prev-class');
  const btnNext = document.getElementById('btn-next-class');
  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      let currentIdx = CLASS_LIST.indexOf(gameState.selectedClass);
      currentIdx = (currentIdx - 1 + CLASS_LIST.length) % CLASS_LIST.length;
      gameState.selectedClass = CLASS_LIST[currentIdx];
      // クラス変更時は前ステージからの引き継ぎ値をリセット
      gameState.currentHeroPower = 0;
      saveGame();
      updateGlobalCurrencyDisplays();
      window.sounds.playSelect();
    });
    btnNext.addEventListener('click', () => {
      let currentIdx = CLASS_LIST.indexOf(gameState.selectedClass);
      currentIdx = (currentIdx + 1) % CLASS_LIST.length;
      gameState.selectedClass = CLASS_LIST[currentIdx];
      gameState.currentHeroPower = 0;
      saveGame();
      updateGlobalCurrencyDisplays();
      window.sounds.playSelect();
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
  
  // 探索ステータス（シールド、鍵）をリセット
  activeGame.shield = 0;
  activeGame.keys = 0;
  
  // レベルデータのロード
  const levelData = cloneObject(STAGES[stageIdx]);
  activeGame.activeLevelData = levelData;
  
  // 選択中のクラス
  const classId = gameState.selectedClass || 'warrior';
  const currentClass = CLASSES[classId];
  
  // 最低保証パワー ＝ クラスの基本攻撃力 ＋ アップグレード分
  const guaranteedPower = currentClass.baseAtk + gameState.upgrades.atk * 5;
  
  // ステージ1 (index 0) 以外の時のみ、引き継ぎパワーを適用する
  let startingPower = guaranteedPower;
  if (stageIdx > 0 && gameState.currentHeroPower > 0) {
    // 前ステージクリア時のパワーを引き継ぐが、最低保証値は維持する
    startingPower = Math.max(guaranteedPower, gameState.currentHeroPower);
  }
  
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
  
  // 探索ステータスをリセット
  activeGame.shield = 0;
  activeGame.keys = 0;
  
  const classId = gameState.selectedClass || 'warrior';
  const currentClass = CLASSES[classId];
  const startingPower = currentClass.baseAtk + gameState.upgrades.atk * 5;
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

// 特殊フロア（ボス・姫）か判定
const isSpecialFloor = (floorIdx) => {
  if (!activeGame.activeLevelData || !activeGame.activeLevelData.towers) return false;
  const towers = activeGame.activeLevelData.towers;
  for (let t = 0; t < towers.length; t++) {
    const floor = towers[t].floors[floorIdx];
    if (floor && (floor.type === 'boss' || floor.type === 'princess')) {
      return true;
    }
  }
  return false;
};

// STAGES の自動補正: ボスおよび姫のフロアを「中央のみ」に修正する
const sanitizeStagesForSingleBossAndPrincess = () => {
  if (typeof STAGES === 'undefined') return;
  STAGES.forEach(stage => {
    if (!stage.towers || stage.towers.length === 0) return;
    const numFloors = stage.towers[0].floors.length;
    for (let f = 0; f < numFloors; f++) {
      let hasSpecial = false;
      let specialEntity = null;
      for (let t = 0; t < stage.towers.length; t++) {
        const floor = stage.towers[t].floors[f];
        if (floor && (floor.type === 'boss' || floor.type === 'princess')) {
          hasSpecial = true;
          specialEntity = { ...floor };
        }
      }
      
      if (hasSpecial) {
        // 中央のマスが boss や princess でない場合、中央にセットする
        const centerFloor = stage.towers[1].floors[f];
        if (!centerFloor || (centerFloor.type !== 'boss' && centerFloor.type !== 'princess')) {
          stage.towers[1].floors[f] = specialEntity || { type: 'empty', val: 0 };
        }
        // 左右のマスを empty にリセットする
        stage.towers[0].floors[f] = { type: 'empty', val: 0 };
        stage.towers[2].floors[f] = { type: 'empty', val: 0 };
      }
    }
  });
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
      
      // 特殊フロア（ボス・姫）の結合表現のためのクラス追加
      if (isSpecialFloor(fIdx)) {
        roomEl.classList.add('special-floor');
        if (tIdx === 0) roomEl.classList.add('special-left');
        else if (tIdx === 1) roomEl.classList.add('special-center');
        else if (tIdx === 2) roomEl.classList.add('special-right');
      }
      
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
      const classId = gameState.selectedClass || 'warrior';
      const classVisual = getDynamicHeroClass(classId, activeGame.heroPower);
      iconEl.innerText = classVisual.icon;
      el.style.borderColor = classVisual.color;
      el.style.boxShadow = `0 0 12px ${classVisual.color}aa, inset 0 0 8px ${classVisual.color}55`;
      valEl.innerText = activeGame.heroPower;
      break;
      
    case 'enemy':
    case 'enemy_sub':
      el.classList.add('entity-enemy', 'entity-enemy-sub');
      iconEl.innerText = getEnemyIcon(data.val);
      valEl.innerText = `-${data.val}`;
      break;
      
    case 'enemy_div':
      el.classList.add('entity-enemy', 'entity-enemy-div');
      iconEl.innerText = '🧟';
      valEl.innerText = `÷${data.val}`;
      break;
      
    case 'boss':
      el.classList.add('entity-boss');
      iconEl.innerText = '👹'; // ボスのアイコン
      valEl.innerText = `-${data.val}`;
      break;
      
    case 'item_add':
      el.classList.add('entity-item');
      iconEl.innerText = '🍎'; // パワーアップ果実
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
      
    case 'item_sword':
      el.classList.add('entity-item');
      iconEl.innerText = '⚔️'; // 伝説の剣
      valEl.innerText = `+${data.val}`;
      break;
      
    case 'item_shield':
      el.classList.add('entity-item', 'entity-item-multiply'); // 水色ネオン調
      iconEl.innerText = '🛡️'; // シールド
      valEl.innerText = `+${data.val}`;
      break;
      
    case 'item_key':
      el.classList.add('entity-item', 'entity-item-multiply');
      iconEl.innerText = '🔑'; // 鍵
      valEl.innerText = '';
      break;
      
    case 'locked_gate':
      el.classList.add('entity-locked-gate');
      iconEl.innerText = '🔒'; // 鍵付き扉
      valEl.innerText = '';
      break;

    case 'wall':
      el.classList.add('entity-wall');
      el.style.background = '#0d0b18';
      el.style.borderColor = 'rgba(255,255,255,0.03)';
      el.style.boxShadow = 'none';
      iconEl.innerText = '🧱';
      valEl.innerText = '';
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
  if (val < 40) return '👺';      // 天狗/ゴブリン
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

// 一直線ダッシュ移動が可能かチェック
const canDashTo = (targetTowerIdx, targetFloorIdx) => {
  const sTower = activeGame.heroPosition.towerIdx;
  const sFloor = activeGame.heroPosition.floorIdx;

  // 直上への移動でなければならない
  if (targetTowerIdx !== sTower || targetFloorIdx <= sFloor) {
    return false;
  }

  const towers = activeGame.activeLevelData.towers;

  // 途中のマスがすべて empty であるかをチェック
  for (let f = sFloor + 1; f < targetFloorIdx; f++) {
    const floorData = towers[sTower].floors[f];
    if (!floorData || floorData.type !== 'empty') {
      return false;
    }
  }

  return true;
};

// 移動可能かどうかのバリデーション
const isValidMove = (targetTowerIdx, targetFloorIdx, floorData) => {
  const sTower = activeGame.heroPosition.towerIdx;
  const sFloor = activeGame.heroPosition.floorIdx;

  // ボスや姫がいる特殊なフロア（結合された広い部屋）への進入、またはそこからの移動は中央（列 index 1）のみ可能
  if (isSpecialFloor(targetFloorIdx) || isSpecialFloor(sFloor)) {
    if (targetTowerIdx !== 1) {
      return false;
    }
  }

  // ヒーロー自身がいる部屋には移動できない
  if (targetTowerIdx === sTower && targetFloorIdx === sFloor) {
    return false;
  }
  
  if (!floorData || floorData.type === 'wall') {
    return false;
  }

  // ロックされた扉の場合、鍵を持っていないと進入できない
  if (floorData.type === 'locked_gate' && activeGame.keys <= 0) {
    return false;
  }

  // 1. 通常の3択移動（左上・直上・右上への1歩上移動）
  const isThreeWayMove = (targetFloorIdx === sFloor + 1) && (Math.abs(targetTowerIdx - sTower) <= 1);
  if (isThreeWayMove) {
    return true;
  }

  // 2. 一直線ダッシュ移動（直上への複数階ダッシュ）
  if (canDashTo(targetTowerIdx, targetFloorIdx)) {
    return true;
  }
  
  return false;
};

// ==================== 10. COMBAT & RESOLUTION ====================

const executeMove = (targetTowerIdx, targetFloorIdx) => {
  const levelData = activeGame.activeLevelData;
  const targetFloor = levelData.towers[targetTowerIdx].floors[targetFloorIdx];
  const sourceTowerIdx = activeGame.heroPosition.towerIdx;
  const sourceFloorIdx = activeGame.heroPosition.floorIdx;
  
  const roomEl = document.querySelector(`.room[data-tower-idx="${targetTowerIdx}"][data-floor-idx="${targetFloorIdx}"]`);
  
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
    const classId = gameState.selectedClass || 'warrior';
    
    switch (targetFloor.type) {
      case 'enemy':
      case 'enemy_sub': {
        // 減算敵: シールドで肩代わり、残りはパワー減算
        const val = targetFloor.val;
        let damage = val;
        let shieldUsed = 0;
        
        if (activeGame.shield > 0) {
          if (activeGame.shield >= damage) {
            activeGame.shield -= damage;
            shieldUsed = damage;
            damage = 0;
          } else {
            shieldUsed = activeGame.shield;
            damage -= activeGame.shield;
            activeGame.shield = 0;
          }
        }
        
        if (damage > 0) {
          activeGame.heroPower -= damage;
        }
        
        if (shieldUsed > 0) {
          powerChangeText = `-${damage} (🛡️-${shieldUsed})`;
        } else {
          powerChangeText = `-${damage}`;
        }
        powerChangeType = 'float-sub';
        
        if (activeGame.heroPower <= 0) {
          activeGame.heroPower = 0;
          isGameOver = true;
        } else {
          // 勝利報酬
          gameState.stats.totalDefeats++;
          let enemyGold = Math.round(val * 0.5);
          goldEarned = applyGoldBonus(enemyGold);
        }
        break;
      }
      
      case 'enemy_div': {
        // 除算敵: シールドが1以上あれば1消費して無効化、なければパワー除算
        const val = targetFloor.val;
        if (activeGame.shield > 0) {
          activeGame.shield--;
          powerChangeText = `BLOCK! (🛡️-1)`;
          window.sounds.playUpgrade(); // 防御成功音
        } else {
          const oldPower = activeGame.heroPower;
          activeGame.heroPower = Math.floor(activeGame.heroPower / val);
          const diff = oldPower - activeGame.heroPower;
          powerChangeText = `÷${val} (-${diff})`;
          if (activeGame.heroPower <= 0) {
            activeGame.heroPower = 0;
            isGameOver = true;
          }
        }
        powerChangeType = 'float-sub';
        
        if (!isGameOver) {
          gameState.stats.totalDefeats++;
          let enemyGold = Math.round(val * 2); // 除算はコストが高いので多めのゴールド
          goldEarned = applyGoldBonus(enemyGold);
        }
        break;
      }
      
      case 'boss': {
        // ボス: 減算敵と同様にシールドで肩代わりし、残りはパワー減算
        const val = targetFloor.val;
        let damage = val;
        let shieldUsed = 0;
        
        if (activeGame.shield > 0) {
          if (activeGame.shield >= damage) {
            activeGame.shield -= damage;
            shieldUsed = damage;
            damage = 0;
          } else {
            shieldUsed = activeGame.shield;
            damage -= activeGame.shield;
            activeGame.shield = 0;
          }
        }
        
        if (damage > 0) {
          activeGame.heroPower -= damage;
        }
        
        if (shieldUsed > 0) {
          powerChangeText = `-${damage} (🛡️-${shieldUsed})`;
        } else {
          powerChangeText = `-${damage}`;
        }
        powerChangeType = 'float-sub';
        
        if (activeGame.heroPower <= 0) {
          activeGame.heroPower = 0;
          isGameOver = true;
        } else {
          // 撃破成功！報酬
          gameState.stats.totalDefeats++;
          let bossGold = val * 2; // ボスは多めのゴールド
          goldEarned = applyGoldBonus(bossGold);
        }
        break;
      }
        
      case 'item_add':
        activeGame.heroPower += targetFloor.val;
        powerChangeText = `+${targetFloor.val}`;
        powerChangeType = 'float-add';
        window.sounds.playUpgrade();
        break;
        
      case 'item_mul':
        // 魔導士クラスの場合は乗算ボーナス (+1)
        const mulVal = (classId === 'mage') ? (targetFloor.val + 1) : targetFloor.val;
        activeGame.heroPower *= mulVal;
        powerChangeText = `x${mulVal}`;
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

      case 'item_sword':
        // 伝説の剣：パワー大幅アップ
        activeGame.heroPower += targetFloor.val;
        powerChangeText = `⚔️ +${targetFloor.val}`;
        powerChangeType = 'float-add';
        window.sounds.playUpgrade();
        break;

      case 'item_shield':
        // イージスの盾：シールド追加
        activeGame.shield += targetFloor.val;
        powerChangeText = `🛡️ +${targetFloor.val}`;
        powerChangeType = 'float-mult'; // 水色/緑系エフェクト
        window.sounds.playUpgrade();
        break;

      case 'item_key':
        // 鍵：鍵の獲得
        activeGame.keys++;
        powerChangeText = `🔑 GET!`;
        powerChangeType = 'float-mult';
        window.sounds.playUpgrade();
        break;

      case 'locked_gate':
        // ロックされた扉：進入時に鍵を消費
        activeGame.keys--;
        powerChangeText = `🔑 UNLOCKED`;
        powerChangeType = 'float-add';
        window.sounds.playUpgrade();
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
    
    // UI反映
    updateGlobalCurrencyDisplays();
    if (heroEl) {
      const valEl = heroEl.querySelector('.entity-val');
      if (valEl) valEl.innerText = activeGame.heroPower;
    }

    // 進化チェック
    const prevClassVisual = getDynamicHeroClass(classId, initialPower);
    const nextClassVisual = getDynamicHeroClass(classId, activeGame.heroPower);
    if (prevClassVisual.name !== nextClassVisual.name) {
      triggerEvolution(prevClassVisual, nextClassVisual);
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
        // 残りの敵がいるか確認
        checkAutoClearCondition();
      }
    }, 200);
    
  }, 200);
};

// 進化ポップアップのトリガー演出
const triggerEvolution = (prev, next) => {
  const overlay = document.getElementById('evolution-overlay');
  const prevIcon = document.getElementById('evo-prev-icon');
  const nextIcon = document.getElementById('evo-next-icon');
  const classNameEl = document.getElementById('evo-class-name');
  
  if (prevIcon) prevIcon.innerText = prev.icon;
  if (nextIcon) {
    nextIcon.innerText = next.icon;
    nextIcon.style.color = next.color;
    nextIcon.style.textShadow = `0 0 15px ${next.color}`;
  }
  if (classNameEl) {
    classNameEl.innerText = next.name;
    classNameEl.style.color = next.color;
  }
  
  window.sounds.playWin(); // 進化時の効果音
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
      // ヒーローの見た目を即座に更新するためにタワーUIを再描画
      generateTowerUI(activeGame.activeLevelData);
    }, 1200);
  }
};

const applyGoldBonus = (baseGold) => {
  const bonusPercent = gameState.upgrades.gold * 15;
  let gold = Math.round(baseGold * (1 + bonusPercent / 100));
  // 冒険者(rogue)クラスは獲得ゴールド+20%
  if (gameState.selectedClass === 'rogue') {
    gold = Math.round(gold * 1.2);
  }
  return gold;
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
    
    // ステータスを次のステージに引き継ぐためにセーブ
    gameState.currentHeroPower = activeGame.heroPower;
    
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
  
  // 2. スキン一覧の非表示化（クラス選択制へ移行したため）
  const skinsContainer = document.getElementById('skins-container');
  if (skinsContainer) {
    skinsContainer.innerHTML = '';
    const skinsSection = skinsContainer.closest('.shop-section');
    if (skinsSection) skinsSection.style.display = 'none';
  }
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
  try {
    // 0. ステージデータのボス・姫の位置を中央一列に自動補正
    sanitizeStagesForSingleBossAndPrincess();

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
  } catch (e) {
    console.error("Initialization Error: ", e);
    const errDiv = document.createElement('div');
    errDiv.style.position = 'fixed';
    errDiv.style.top = '0';
    errDiv.style.left = '0';
    errDiv.style.width = '100%';
    errDiv.style.background = 'red';
    errDiv.style.color = 'white';
    errDiv.style.zIndex = '99999';
    errDiv.style.padding = '20px';
    errDiv.style.fontSize = '16px';
    errDiv.style.fontFamily = 'monospace';
    errDiv.innerText = "Error: " + e.message + "\nStack: " + e.stack;
    document.body.appendChild(errDiv);
  }
});

// ==================== 14. STAGE DEFINITIONS (GRID DUNGEONS) ====================
const STAGES = [
  // Stage 1: 基本の3択と加算・減算
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 5 }, { type: 'item_add', val: 10 }, { type: 'boss', val: 20 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'empty', val: 0 }, { type: 'item_add', val: 15 }, { type: 'boss', val: 20 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 5 }, { type: 'item_add', val: 10 }, { type: 'boss', val: 20 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 2: 除算と乗算の初登場
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 5 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_add', val: 20 }, { type: 'empty', val: 0 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 5 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 3: シールドと一直線ダッシュの体験
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 10 }, { type: 'enemy_sub', val: 15 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 10 }, { type: 'item_add', val: 20 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 10 }, { type: 'enemy_sub', val: 15 }, { type: 'boss', val: 25 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 4: 鍵と扉の仕組み
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 35 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 10 }, { type: 'item_add', val: 30 }, { type: 'boss', val: 35 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 35 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 5: 盾で除算を防ぐ
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 5 }, { type: 'item_mul', val: 2 }, { type: 'item_add', val: 15 }, { type: 'boss', val: 50 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_div', val: 2 }, { type: 'enemy_sub', val: 10 }, { type: 'empty', val: 0 }, { type: 'boss', val: 50 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 5 }, { type: 'item_mul', val: 2 }, { type: 'item_add', val: 15 }, { type: 'boss', val: 50 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 6: ダッシュと左右選択
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 20 }, { type: 'item_add', val: 30 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 60 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 15 }, { type: 'enemy_sub', val: 10 }, { type: 'item_add', val: 10 }, { type: 'boss', val: 60 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 20 }, { type: 'item_add', val: 30 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 60 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 7: シールドと多数の減算敵
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 40 }, { type: 'enemy_div', val: 2 }, { type: 'item_shield', val: 10 }, { type: 'boss', val: 80 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 15 }, { type: 'item_add', val: 20 }, { type: 'empty', val: 0 }, { type: 'boss', val: 80 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 40 }, { type: 'enemy_div', val: 2 }, { type: 'item_shield', val: 10 }, { type: 'boss', val: 80 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 8: 伝説の剣(item_sword)とボスの強襲
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_div', val: 3 }, { type: 'item_add', val: 50 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 100 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 12 }, { type: 'enemy_sub', val: 30 }, { type: 'item_add', val: 10 }, { type: 'boss', val: 100 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_div', val: 3 }, { type: 'item_add', val: 50 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 100 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 9: 複雑なパズル、鍵と除算
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_add', val: 60 }, { type: 'boss', val: 120 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 15 }, { type: 'enemy_sub', val: 20 }, { type: 'item_mul', val: 3 }, { type: 'boss', val: 120 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_add', val: 60 }, { type: 'boss', val: 120 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 10: ダッシュ移動を駆使する難関
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 40 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'boss', val: 150 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_add', val: 80 }, { type: 'item_shield', val: 20 }, { type: 'enemy_sub', val: 30 }, { type: 'boss', val: 150 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 40 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'boss', val: 150 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 11: 高難度 3択の交差
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 50 }, { type: 'item_add', val: 100 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 50 }, { type: 'boss', val: 200 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 30 }, { type: 'enemy_sub', val: 30 }, { type: 'item_mul', val: 2 }, { type: 'empty', val: 0 }, { type: 'boss', val: 200 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 50 }, { type: 'item_add', val: 100 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 50 }, { type: 'boss', val: 200 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 12: 盾と剣の試練
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 80 }, { type: 'enemy_div', val: 3 }, { type: 'item_mul', val: 3 }, { type: 'item_add', val: 50 }, { type: 'boss', val: 250 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 60 }, { type: 'item_shield', val: 25 }, { type: 'enemy_sub', val: 40 }, { type: 'empty', val: 0 }, { type: 'boss', val: 250 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 80 }, { type: 'enemy_div', val: 3 }, { type: 'item_mul', val: 3 }, { type: 'item_add', val: 50 }, { type: 'boss', val: 250 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 13: 鍵が二つ必要なステージ
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 300 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 30 }, { type: 'enemy_sub', val: 50 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 150 }, { type: 'boss', val: 300 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 300 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 14: ダッシュとブロッキング
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 80 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 4 }, { type: 'item_add', val: 100 }, { type: 'boss', val: 400 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_add', val: 200 }, { type: 'item_shield', val: 40 }, { type: 'enemy_sub', val: 100 }, { type: 'empty', val: 0 }, { type: 'boss', val: 400 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'enemy_sub', val: 80 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 4 }, { type: 'item_add', val: 100 }, { type: 'boss', val: 400 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 15: 大いなる魔導
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_add', val: 100 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'item_shield', val: 20 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 600 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 120 }, { type: 'item_shield', val: 50 }, { type: 'enemy_sub', val: 80 }, { type: 'item_add', val: 150 }, { type: 'empty', val: 0 }, { type: 'boss', val: 600 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_add', val: 100 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'item_shield', val: 20 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 600 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 16: シールド管理の極限
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 40 }, { type: 'enemy_div', val: 3 }, { type: 'item_mul', val: 3 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 800 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 150 }, { type: 'item_add', val: 300 }, { type: 'enemy_sub', val: 100 }, { type: 'item_shield', val: 30 }, { type: 'item_add', val: 200 }, { type: 'boss', val: 800 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 40 }, { type: 'enemy_div', val: 3 }, { type: 'item_mul', val: 3 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 800 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 17: 奈落のダッシュ
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'empty', val: 0 }, { type: 'item_add', val: 200 }, { type: 'enemy_sub', val: 200 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 100 }, { type: 'boss', val: 1000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'empty', val: 0 }, { type: 'item_add', val: 300 }, { type: 'item_shield', val: 60 }, { type: 'item_mul', val: 4 }, { type: 'empty', val: 0 }, { type: 'boss', val: 1000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'empty', val: 0 }, { type: 'item_add', val: 200 }, { type: 'enemy_sub', val: 200 }, { type: 'enemy_div', val: 2 }, { type: 'item_add', val: 100 }, { type: 'boss', val: 1000 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 18: 王国の守護者
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 300 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 1500 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_sub', val: 250 }, { type: 'item_shield', val: 80 }, { type: 'enemy_sub', val: 150 }, { type: 'item_add', val: 400 }, { type: 'enemy_div', val: 2 }, { type: 'boss', val: 1500 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_sword', val: 300 }, { type: 'enemy_div', val: 2 }, { type: 'item_mul', val: 3 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 1500 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 19: 死線と希望の門
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 100 }, { type: 'item_mul', val: 4 }, { type: 'item_add', val: 500 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 2000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'enemy_div', val: 4 }, { type: 'enemy_sub', val: 300 }, { type: 'enemy_sub', val: 200 }, { type: 'item_shield', val: 50 }, { type: 'item_mul', val: 2 }, { type: 'boss', val: 2000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_shield', val: 100 }, { type: 'item_mul', val: 4 }, { type: 'item_add', val: 500 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'boss', val: 2000 }, { type: 'princess', val: 0 }] }
    ]
  },
  // Stage 20: ゴッド・オブルイン
  {
    towers: [
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_sword', val: 1000 }, { type: 'item_mul', val: 4 }, { type: 'item_key', val: 0 }, { type: 'boss', val: 5000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'hero', val: 0 }, { type: 'item_shield', val: 120 }, { type: 'enemy_sub', val: 500 }, { type: 'enemy_div', val: 2 }, { type: 'enemy_sub', val: 800 }, { type: 'item_add', val: 1000 }, { type: 'boss', val: 5000 }, { type: 'princess', val: 0 }] },
      { floors: [{ type: 'empty', val: 0 }, { type: 'item_key', val: 0 }, { type: 'locked_gate', val: 0 }, { type: 'item_sword', val: 1000 }, { type: 'item_mul', val: 4 }, { type: 'item_key', val: 0 }, { type: 'boss', val: 5000 }, { type: 'princess', val: 0 }] }
    ]
  }
];

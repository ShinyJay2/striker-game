# ⚾️ Striker Game (스트라이커 게임)

친구 또는 AI와 함께하는 실시간 숫자 추리 게임입니다.  
상대방이 생각한 3자리 비밀 숫자를 누가 더 빨리 맞추는지 대결해보세요!

### 🎮 [게임 플레이하기 (Live Link)](https://striker-game.onrender.com)
위 링크를 클릭하면 설치 없이 바로 플레이할 수 있습니다.

---

## 📋 게임 규칙 (Game Rules)

이 게임은 **숫자 야구(Bulls and Cows)** 룰을 기반으로 합니다.

1. **목표** 상대방(또는 컴퓨터)이 설정한 **0~9 사이의 서로 다른 숫자 3개**를 먼저 맞추는 쪽이 승리합니다. (예: `0 2 3`)

2. **판정 시스템** 추측한 숫자에 대해 다음과 같은 힌트가 주어집니다.
   - **🟢 스트라이크 (Strike):** 숫자와 위치가 모두 정확할 때.
   - **🔵 볼 (Ball):** 숫자는 포함되지만, 위치가 다를 때.
   - **🔴 3 아웃 (3 Out):** 추측한 숫자 3개가 하나도 맞지 않을 때.

3. **예시** - **정답:** `0 2 3`
   - **추측:** `1 3 4`
   - **결과:** **1 Ball** (3은 정답에 포함되지만 위치가 다름, 1과 4는 없음)

---

## 🕹️ 플레이 모드 (Modes)

### 1. 1 vs 1 (친구 대전)
- 실시간으로 친구와 대결하는 모드입니다.
- **방 만들기:** 방 이름(예: `ROOM1`)을 입력하고 방을 만듭니다.
- **참여하기:** 친구에게 방 이름을 알려주면, 친구가 같은 방 이름으로 접속하여 대결이 시작됩니다.

### 2. vs Computer (AI 대전)
- 똑똑한 AI 알고리즘과 대결하는 모드입니다.
- 플레이어가 추측할 때마다 AI도 플레이어의 숫자를 추리하며, AI는 가능한 모든 경우의 수를 계산하여 점차 정답을 좁혀옵니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** HTML5, CSS3 (Mobile Responsive), JavaScript
- **Backend:** Node.js, Express
- **Real-time Communication:** Socket.io
- **Deployment:** Render

---

### 🚀 설치 및 로컬 실행 (Run Locally)

내 컴퓨터에서 코드를 직접 수정하거나 실행해보고 싶다면 아래 명령어를 사용하세요.

```bash
# 저장소 복제
git clone [https://github.com/YOUR_GITHUB_ID/striker-game.git](https://github.com/YOUR_GITHUB_ID/striker-game.git)

# 폴더 이동
cd striker-game

# 패키지 설치
npm install

# 서버 실행
node server.js

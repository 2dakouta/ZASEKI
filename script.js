// データ管理
let appData = JSON.parse(localStorage.getItem('seatManagementData')) || {
  seats: [
      { id: 1, number: 'A1', status: 'available', occupant: null, x: 0, y: 0 },
      { id: 2, number: 'A2', status: 'available', occupant: null, x: 10, y: 0 },
      { id: 3, number: 'B1', status: 'available', occupant: null, x: 0, y: 10 },
      { id: 4, number: 'B2', status: 'available', occupant: null, x: 10, y: 10 },
  ],
  members: ['山田太郎', '佐藤花子', '鈴木一郎', '高橋二郎', '田中三郎'],
  history: []
};

function saveData() {
  localStorage.setItem('seatManagementData', JSON.stringify(appData));
}

// UI管理
const UI = {
  seatGrid: document.getElementById('seatGrid'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),

  renderSeats() {
      this.seatGrid.innerHTML = '';
      appData.seats.forEach(seat => {
          const seatElement = document.createElement('div');
          seatElement.className = `seat ${seat.status}`;
          seatElement.innerHTML = `
              <div>${seat.number}</div>
              <div>${seat.status === 'available' ? '利用可能' : '使用中'}</div>
              ${seat.occupant ? `<div>${seat.occupant}</div>` : ''}
          `;
          seatElement.style.left = `${seat.x}%`;
          seatElement.style.top = `${seat.y}%`;
          seatElement.addEventListener('click', () => SeatManager.handleSeatClick(seat));
          this.seatGrid.appendChild(seatElement);
      });
  },

  showModal(title, content) {
      this.modalTitle.textContent = title;
      this.modalBody.innerHTML = content;
      this.modal.style.display = 'block';
  },

  closeModal() {
      this.modal.style.display = 'none';
  }
};

// 座席管理
const SeatManager = {
  handleSeatClick(seat) {
      if (seat.status === 'occupied') {
          this.unregisterSeat(seat);
      } else {
          this.showMemberSelection(seat);
      }
  },

  showMemberSelection(seat) {
      let content = '<h3>メンバーを選択してください</h3>';
      appData.members.forEach(member => {
          content += `<button onclick="SeatManager.registerSeat('${seat.id}', '${member}')">${member}</button>`;
      });
      UI.showModal('座席登録', content);
  },

  registerSeat(seatId, name) {
      const seat = appData.seats.find(s => s.id === parseInt(seatId));
      if (seat) {
          seat.status = 'occupied';
          seat.occupant = name;
          appData.history.push({
              date: new Date().toLocaleString(),
              user: name,
              action: `座席${seat.number}に登録`
          });
          saveData();
          UI.renderSeats();
          UI.closeModal();
      }
  },

  unregisterSeat(seat) {
      if (confirm(`${seat.occupant}さんの座席登録を解除しますか？`)) {
          appData.history.push({
              date: new Date().toLocaleString(),
              user: seat.occupant,
              action: `座席${seat.number}の登録を解除`
          });
          seat.status = 'available';
          seat.occupant = null;
          saveData();
          UI.renderSeats();
      }
  }
};

// レイアウト管理
const LayoutManager = {
  isEditMode: false,

  toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      document.getElementById('layoutBtn').textContent = this.isEditMode ? 'レイアウト固定' : 'レイアウト編集';
      document.getElementById('addDeskBtn').style.display = this.isEditMode ? 'inline-block' : 'none';
      document.getElementById('addObstacleBtn').style.display = this.isEditMode ? 'inline-block' : 'none';
      if (this.isEditMode) {
          this.enableDragAndDrop();
      } else {
          this.disableDragAndDrop();
      }
  },

  enableDragAndDrop() {
      const seats = document.querySelectorAll('.seat');
      seats.forEach(seat => {
          seat.draggable = true;
          seat.addEventListener('dragstart', this.dragStart);
          seat.addEventListener('dragend', this.dragEnd);
      });
      UI.seatGrid.addEventListener('dragover', this.dragOver);
      UI.seatGrid.addEventListener('drop', this.drop);
  },

  disableDragAndDrop() {
      const seats = document.querySelectorAll('.seat');
      seats.forEach(seat => {
          seat.draggable = false;
          seat.removeEventListener('dragstart', this.dragStart);
          seat.removeEventListener('dragend', this.dragEnd);
      });
      UI.seatGrid.removeEventListener('dragover', this.dragOver);
      UI.seatGrid.removeEventListener('drop', this.drop);
  },

  dragStart(e) {
      e.dataTransfer.setData('text/plain', e.target.querySelector('div').textContent);
  },

  dragOver(e) {
      e.preventDefault();
  },

  drop(e) {
      e.preventDefault();
      const seatNumber = e.dataTransfer.getData('text');
      const seat = appData.seats.find(s => s.number === seatNumber);
      if (seat) {
          const rect = UI.seatGrid.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / rect.width * 100);
          const y = Math.floor((e.clientY - rect.top) / rect.height * 100);
          seat.x = Math.min(Math.max(x, 0), 90);
          seat.y = Math.min(Math.max(y, 0), 90);
          saveData();
          UI.renderSeats();
      }
  },

  dragEnd() {
      saveData();
  },

  addDesk() {
      const newId = Math.max(...appData.seats.map(s => s.id)) + 1;
      const newSeat = {
          id: newId,
          number: `Desk${newId}`,
          status: 'available',
          occupant: null,
          x: 0,
          y: 0
      };
      appData.seats.push(newSeat);
      saveData();
      UI.renderSeats();
  },

  addObstacle() {
      // 障害物の追加ロジックをここに実装
      alert('障害物追加機能は未実装です。');
  }
};

// 履歴管理
const HistoryManager = {
  showHistory() {
      let content = `
          <table>
              <tr>
                  <th>日時</th>
                  <th>ユーザー</th>
                  <th>アクション</th>
              </tr>
              ${appData.history.map(entry => `
                  <tr>
                      <td>${entry.date}</td>
                      <td>${entry.user}</td>
                      <td>${entry.action}</td>
                  </tr>
              `).join('')}
          </table>
      `;
      UI.showModal('履歴', content);
  }
};

// ... 前のコードは省略 ...

// メンバー管理
const MemberManager = {
  showMemberManagement() {
      let content = `
          <h3>メンバー一覧</h3>
          <ul id="memberList">
              ${appData.members.map(member => `
                  <li>
                      ${member}
                      <button onclick="MemberManager.removeMember('${member}')">削除</button>
                  </li>
              `).join('')}
          </ul>
          <h3>メンバー追加</h3>
          <input type="text" id="newMemberName" placeholder="新しいメンバーの名前">
          <button onclick="MemberManager.addMember()">追加</button>
      `;
      UI.showModal('メンバー管理', content);
  },

  addMember() {
      const newMemberName = document.getElementById('newMemberName').value.trim();
      if (newMemberName && !appData.members.includes(newMemberName)) {
          appData.members.push(newMemberName);
          saveData();
          this.updateMemberList();
      } else {
          alert('有効な名前を入力してください。');
      }
  },

  removeMember(member) {
      if (confirm(`${member}さんを削除しますか？`)) {
          appData.members = appData.members.filter(m => m !== member);
          // 座席から該当メンバーを削除
          appData.seats.forEach(seat => {
              if (seat.occupant === member) {
                  seat.status = 'available';
                  seat.occupant = null;
              }
          });
          saveData();
          this.updateMemberList();
          UI.renderSeats();
      }
  },

  updateMemberList() {
      const memberList = document.getElementById('memberList');
      if (memberList) {
          memberList.innerHTML = appData.members.map(member => `
              <li>
                  ${member}
                  <button onclick="MemberManager.removeMember('${member}')">削除</button>
              </li>
          `).join('');
      }
      document.getElementById('newMemberName').value = ''; // 入力フィールドをクリア
  }
};
// イベントリスナー
document.getElementById('layoutBtn').addEventListener('click', () => LayoutManager.toggleEditMode());
document.getElementById('addDeskBtn').addEventListener('click', () => LayoutManager.addDesk());
document.getElementById('addObstacleBtn').addEventListener('click', () => LayoutManager.addObstacle());
document.getElementById('historyBtn').addEventListener('click', () => HistoryManager.showHistory());
document.getElementById('manageMembersBtn').addEventListener('click', () => MemberManager.showMemberManagement());
document.querySelector('.close').addEventListener('click', () => UI.closeModal());

// 初期化
UI.renderSeats();
// ====== 获取页面元素 ======
    const typeSelect = document.getElementById('typeSelect');
    const categorySelect = document.getElementById('categorySelect');
    const amountInput = document.getElementById('amountInput');
    const dateInput = document.getElementById('dateInput');
    const noteInput = document.getElementById('noteInput');
    const submitBtn = document.getElementById('submitBtn');
    const tableBody = document.querySelector('tbody');
    const monthIncome = document.getElementById('monthIncome');
    const monthExpense = document.getElementById('monthExpense');
    const monthBalance = document.getElementById('monthBalance');
    const headerMonth = document.getElementById('headerMonth');
// ====== 从 localStorage 读取账单数组 ======
// 如果没有存过，就用空数组
    let bills = JSON.parse(localStorage.getItem('bills')) || [];
// ====== 页面加载时 ======
// 自动填上今天的日期
    dateInput.value = new Date().toISOString().split('T')[0];
    updateHeaderMonth();
// 渲染表格
    renderTable();
// ====== 监听提交按钮点击 ======
    submitBtn.addEventListener('click', function () {
    // 1. 获取表单数据
        const type = typeSelect.value;
        const category = categorySelect.value;
        const amount = parseFloat(amountInput.value);
        const date = dateInput.value;
        const note = noteInput.value || '—';  // 没写备注就显示 —

    // 2. 校验：不能有空值
        if (!type || !category || !amount || !date) {
            alert('请把类型、分类、金额、日期都填上');
            return;
        }

    // 3. 创建一条账单对象
    const bill = {
        id: Date.now(),        // 用时间戳做唯一 id
        type: type,            // 'income' 或 'expense'
        category: category,
        amount: amount,
        date: date,
        note: note,
    };

    // 4. 加到数组头部（最新的在最上面）
    bills.unshift(bill);

    // 5. 存到 localStorage
    saveBills();

    // 6. 重新渲染表格
    renderTable();

    // 7. 清空表单
    amountInput.value = '';
    noteInput.value = '';
    typeSelect.value = '';
    categorySelect.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
  });
// 保存到 localStorage
    function saveBills() {
        localStorage.setItem('bills', JSON.stringify(bills));
    }
    function renderTable() {
    // 如果没数据，显示占位文字
        if (bills.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">暂无记录</td></tr>';
            updateSummary();
            return;
        }

    // 把每条账单拼成 HTML
        let html = '';
        bills.forEach(function (bill) {
    // 收入显示 + 号，绿色；支出显示 - 号，红色
            const sign = bill.type === 'income' ? '+' : '-';
            const color = bill.type === 'income' ? 'color: #27ae60' : 'color: #e74c3c';

            html += `
                <tr>
                <td>${bill.date}</td>
                <td>${bill.category}</td>
                <td>${bill.note}</td>
                <td style="${color}">${sign}¥${bill.amount.toFixed(2)}</td>
                <td>
                    <button class="del-btn" data-id="${bill.id}">删除</button>
                </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    // 给每个删除按钮绑事件
        document.querySelectorAll('.del-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = Number(this.getAttribute('data-id'));
            deleteBill(id);
            });
        });

        updateSummary();
    }
    function deleteBill(id) {
        if (!confirm('确定要删除这条记录吗？')) {
            return;   // 用户点了取消，直接退出，不删了
        }
        bills = bills.filter(function (bill) {
        return bill.id !== id;
        });
        saveBills();
        renderTable();
    }
    function updateSummary() {
        const now = new Date();
        const currentMonth = now.getMonth();   // 0-11，比如 7 月是 6
        const currentYear = now.getFullYear();

    // 筛选出本月账单
        const monthBills = bills.filter(function (bill) {
            const billDate = new Date(bill.date);
            return billDate.getFullYear() === currentYear && billDate.getMonth() === currentMonth;
        });

    // 算本月收入
    let income = 0;
        monthBills.forEach(function (bill) {
            if (bill.type === 'income') {
                income += bill.amount;
            }
        });
    // 算本月支出
    let expense = 0;
        monthBills.forEach(function (bill) {
            if (bill.type === 'expense') {
                expense += bill.amount;
            }
        });

    // 算结余
    const balance = income - expense;

    // 更新页面显示
    monthIncome.textContent = '¥' + income.toFixed(2);
    monthExpense.textContent = '¥' + expense.toFixed(2);
    monthBalance.textContent = '¥' + balance.toFixed(2);
  }
  function updateHeaderMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;   // getMonth 返回 0-11，所以要 +1
    headerMonth.textContent = year + '年' + month + '月';
  }

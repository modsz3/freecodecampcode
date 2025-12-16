import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Users, Receipt, TrendingUp, DollarSign, X, ArrowRight, AlertCircle } from 'lucide-react';

// Storage abstraction layer - works in both Claude artifacts and standard browsers
const storage = {
  async get(key) {
    try {
      // Try Claude artifact storage first
      if (window.storage && typeof window.storage.get === 'function') {
        return await window.storage.get(key);
      }
      // Fallback to localStorage
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.warn('Storage get failed:', error);
      return null;
    }
  },
  
  async set(key, value) {
    try {
      // Try Claude artifact storage first
      if (window.storage && typeof window.storage.set === 'function') {
        return await window.storage.set(key, value);
      }
      // Fallback to localStorage
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      console.error('Storage set failed:', error);
      return null;
    }
  }
};

export default function ExpenseSplitter() {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsResult = await storage.get('groups');
      const expensesResult = await storage.get('expenses');
      const paymentsResult = await storage.get('payments');
      
      if (groupsResult?.value) {
        setGroups(JSON.parse(groupsResult.value));
      }
      if (expensesResult?.value) {
        setExpenses(JSON.parse(expensesResult.value));
      }
      if (paymentsResult?.value) {
        setPayments(JSON.parse(paymentsResult.value));
      }
    } catch (error) {
      console.log('No existing data found, starting fresh');
    }
  };

  const saveData = async (newGroups, newExpenses, newPayments = payments) => {
    try {
      await storage.set('groups', JSON.stringify(newGroups));
      await storage.set('expenses', JSON.stringify(newExpenses));
      await storage.set('payments', JSON.stringify(newPayments));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const addGroup = (name, members) => {
    const newGroup = {
      id: crypto.randomUUID(),
      name,
      members: members.map(m => ({ 
        name: m, 
        id: crypto.randomUUID()
      })),
      createdAt: new Date().toISOString()
    };
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    saveData(newGroups, expenses, payments);
    setShowAddGroup(false);
  };

  const addExpense = (groupId, description, amount, paidBy, splitType, customSplits) => {
    const group = groups.find(g => g.id === groupId);
    let splits = [];

    if (splitType === 'equal') {
      const perPerson = amount / group.members.length;
      splits = group.members.map(m => ({ 
        memberId: m.id, 
        amount: perPerson 
      }));
    } else if (splitType === 'custom') {
      splits = customSplits;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      groupId,
      description,
      amount,
      paidBy,
      splits,
      splitType,
      date: new Date().toISOString()
    };

    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    saveData(groups, newExpenses, payments);
    setShowAddExpense(false);
  };

  // Memoize expensive calculations
  const calculateBalances = useMemo(() => {
    return (groupId) => {
      const groupExpenses = expenses.filter(e => e.groupId === groupId);
      const groupPayments = payments.filter(p => p.groupId === groupId);
      const group = groups.find(g => g.id === groupId);
      if (!group) return {};
      
      const balances = {};

      group.members.forEach(m => {
        balances[m.id] = 0;
      });

      // Add expenses
      groupExpenses.forEach(expense => {
        balances[expense.paidBy] += expense.amount;
        expense.splits.forEach(split => {
          balances[split.memberId] -= split.amount;
        });
      });

      // Subtract settlement payments
      groupPayments.forEach(payment => {
        balances[payment.fromId] += payment.amount;
        balances[payment.toId] -= payment.amount;
      });

      return balances;
    };
  }, [expenses, groups, payments]);

  const settleDebts = (balances, group) => {
    const settlements = [];
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance > 0.01) {
        creditors.push({ memberId, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ memberId, amount: Math.abs(balance) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const payment = Math.min(creditors[i].amount, debtors[j].amount);
      const fromMember = group.members.find(m => m.id === debtors[j].memberId);
      const toMember = group.members.find(m => m.id === creditors[i].memberId);

      settlements.push({
        from: fromMember.name,
        fromId: fromMember.id,
        to: toMember.name,
        toId: toMember.id,
        amount: payment
      });

      creditors[i].amount -= payment;
      debtors[j].amount -= payment;

      if (creditors[i].amount < 0.01) i++;
      if (debtors[j].amount < 0.01) j++;
    }

    return settlements;
  };

  const recordPayment = (groupId, fromId, toId, amount) => {
    const newPayment = {
      id: crypto.randomUUID(),
      groupId,
      fromId,
      toId,
      amount,
      date: new Date().toISOString()
    };

    const newPayments = [...payments, newPayment];
    setPayments(newPayments);
    saveData(groups, expenses, newPayments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="text-indigo-600" />
                Smart Expense Splitter
              </h1>
              <p className="text-gray-600 mt-1">Manage group expenses intelligently</p>
            </div>
            <button
              onClick={() => setShowAddGroup(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} />
              New Group
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'dashboard'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('groups')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'groups'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            Groups
          </button>
        </div>

        {/* Main Content */}
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Users />}
              title="Active Groups"
              value={groups.length}
              color="blue"
            />
            <StatCard
              icon={<Receipt />}
              title="Total Expenses"
              value={expenses.length}
              color="green"
            />
            <StatCard
              icon={<TrendingUp />}
              title="Total Spent"
              value={`$${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`}
              color="purple"
            />
          </div>
        )}

        {activeView === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Groups Yet</h3>
                <p className="text-gray-500 mb-4">Create your first group to start tracking expenses</p>
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition"
                >
                  <Plus size={20} />
                  Create Group
                </button>
              </div>
            ) : (
              groups.map(group => {
                const groupExpenses = expenses.filter(e => e.groupId === group.id);
                const totalSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
                
                return (
                  <GroupCard
                    key={group.id}
                    group={group}
                    totalSpent={totalSpent}
                    expenseCount={groupExpenses.length}
                    onClick={() => {
                      setSelectedGroup(group);
                      setActiveView('groupDetail');
                    }}
                  />
                );
              })
            )}
          </div>
        )}

        {activeView === 'groupDetail' && selectedGroup && (
          <GroupDetail
            group={selectedGroup}
            expenses={expenses.filter(e => e.groupId === selectedGroup.id)}
            payments={payments.filter(p => p.groupId === selectedGroup.id)}
            onAddExpense={() => setShowAddExpense(true)}
            onBack={() => {
              setActiveView('groups');
              setSelectedGroup(null);
            }}
            calculateBalances={calculateBalances}
            settleDebts={settleDebts}
            onRecordPayment={recordPayment}
          />
        )}

        {/* Modals */}
        {showAddGroup && (
          <AddGroupModal
            onClose={() => setShowAddGroup(false)}
            onAdd={addGroup}
          />
        )}

        {showAddExpense && selectedGroup && (
          <AddExpenseModal
            group={selectedGroup}
            onClose={() => setShowAddExpense(false)}
            onAdd={addExpense}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, totalSpent, expenseCount, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
        <Users size={16} />
        <span>{group.members.length} members</span>
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-gray-600 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-indigo-600">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Expenses</p>
          <p className="text-2xl font-bold text-gray-800">{expenseCount}</p>
        </div>
      </div>
    </div>
  );
}

function GroupDetail({ group, expenses, payments, onAddExpense, onBack, calculateBalances, settleDebts, onRecordPayment }) {
  const balances = useMemo(() => calculateBalances(group.id), [calculateBalances, group.id]);
  const settlements = useMemo(() => settleDebts(balances, group), [balances, group]);

  const handleSettlement = (settlement) => {
    if (window.confirm(`Mark payment: ${settlement.from} paid ${settlement.to} $${settlement.amount.toFixed(2)}?`)) {
      onRecordPayment(group.id, settlement.fromId, settlement.toId, settlement.amount);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Groups
          </button>
          <button
            onClick={onAddExpense}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {group.members.map(m => (
            <span key={m.id} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {settlements.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Who Owes What</h3>
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{s.from}</span>
                  <ArrowRight className="inline mx-2" size={16} />
                  <span className="font-medium">{s.to}</span>
                </div>
                <span className="text-green-600 font-bold text-lg">
                  ${s.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleSettlement(s)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : expenses.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 text-green-600">
            <AlertCircle size={20} />
            <span className="font-medium">All settled up! No one owes anyone.</span>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
        <div className="space-y-3">
          {expenses.length === 0 && payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet. Add an expense to get started!</p>
          ) : (
            [...expenses.map(e => ({ ...e, type: 'expense' })), 
             ...payments.map(p => ({ ...p, type: 'payment' }))]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(transaction => {
                if (transaction.type === 'expense') {
                  const payer = group.members.find(m => m.id === transaction.paidBy);
                  return (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{transaction.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Paid by {payer?.name} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-indigo-600">
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      {transaction.splitType === 'custom' && (
                        <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                          <span className="font-medium">Custom split:</span>{' '}
                          {transaction.splits.map((split, idx) => {
                            const member = group.members.find(m => m.id === split.memberId);
                            return `${member?.name} ($${split.amount.toFixed(2)})${idx < transaction.splits.length - 1 ? ', ' : ''}`;
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const fromMember = group.members.find(m => m.id === transaction.fromId);
                  const toMember = group.members.find(m => m.id === transaction.toId);
                  return (
                    <div key={transaction.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-green-800">Payment Recorded</h4>
                          <p className="text-sm text-green-700 mt-1">
                            {fromMember?.name} paid {toMember?.name} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                }
              })
          )}
        </div>
      </div>
    </div>
  );
}

function AddGroupModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (name.trim() && members.length >= 2) {
      onAdd(name, members);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Roommates, Trip to Japan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Members (minimum 2)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMember()}
                placeholder="Enter name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={addMember}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                  <span>{member}</span>
                  <button
                    onClick={() => removeMember(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || members.length < 2}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ group, onClose, onAdd }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || '');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState(
    group.members.map(m => ({ memberId: m.id, amount: '' }))
  );
  const [error, setError] = useState('');

  const handleCustomSplitChange = (memberId, value) => {
    setCustomSplits(customSplits.map(s => 
      s.memberId === memberId ? { ...s, amount: value } : s
    ));
    setError('');
  };

  const validateCustomSplits = () => {
    const totalAmount = parseFloat(amount);
    const splitTotal = customSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    
    if (Math.abs(totalAmount - splitTotal) > 0.01) {
      setError(`Split amounts ($${splitTotal.toFixed(2)}) must equal total ($${totalAmount.toFixed(2)})`);
      return false;
    }
    
    const hasInvalid = customSplits.some(s => !s.amount || parseFloat(s.amount) <= 0);
    if (hasInvalid) {
      setError('All members must have a valid amount greater than 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidBy) {
      setError('Please fill in all required fields');
      return;
    }

    if (splitType === 'custom' && !validateCustomSplits()) {
      return;
    }

    const finalSplits = splitType === 'custom' 
      ? customSplits.map(s => ({ memberId: s.memberId, amount: parseFloat(s.amount) }))
      : [];

    onAdd(group.id, description, parseFloat(amount), paidBy, splitType, finalSplits);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner, Groceries, Uber"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid By *
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {group.members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Split Type *
            </label>
            <select
              value={splitType}
              onChange={(e) => {
                setSplitType(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="equal">Split Equally</option>
              <option value="custom">Custom Amounts</option>
            </select>
          </div>

          {splitType === 'custom' && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter amount for each person:
              </label>
              <div className="space-y-2">
                {group.members.map(member => {
                  const split = customSplits.find(s => s.memberId === member.id);
                  return (
                    <div key={member.id} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-24 truncate">{member.name}</span>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={split?.amount || ''}
                          onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!description.trim() || !amount || !paidBy}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
export interface IndividualExpense {
  id: string;
  person: string; // Who is paying for this alone
  item: string;   // What is it
  cost: number;   // How much
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface CalculatorState {
  totalBill: number;
  people: string[];
  individualExpenses: IndividualExpense[];
}

export interface CommandResult {
  reply: string;
  data: {
    setTotal?: number;
    addPeople?: string[];
    addExpense?: { person: string; item: string; cost: number }[];
    removeExpenseId?: string;
  }
}
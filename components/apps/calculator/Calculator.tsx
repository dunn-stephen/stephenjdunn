"use client";

import { useReducer } from "react";
import type { AppProps } from "@/types";

type Operator = "add" | "subtract" | "multiply" | "divide";

type CalculatorAction =
  | { type: "input-digit"; digit: string }
  | { type: "input-decimal" }
  | { type: "set-operator"; operator: Operator }
  | { type: "evaluate" }
  | { type: "clear" }
  | { type: "toggle-sign" }
  | { type: "percent" };

type ButtonTone = "number" | "utility" | "operator" | "equals";

interface CalculatorState {
  display: string;
  storedValue: number | null;
  pendingOperator: Operator | null;
  waitingForOperand: boolean;
  justEvaluated: boolean;
  lastOperator: Operator | null;
  lastOperand: number | null;
}

interface CalculatorButtonDefinition {
  label: string;
  tone: ButtonTone;
  span?: number;
  action: CalculatorAction;
}

interface CalculatorButtonProps {
  definition: CalculatorButtonDefinition;
  isActive: boolean;
  onPress: (action: CalculatorAction) => void;
}

const INITIAL_STATE: CalculatorState = {
  display: "0",
  storedValue: null,
  pendingOperator: null,
  waitingForOperand: false,
  justEvaluated: false,
  lastOperator: null,
  lastOperand: null
};

const BUTTONS: CalculatorButtonDefinition[] = [
  { label: "C", tone: "utility", action: { type: "clear" } },
  { label: "±", tone: "utility", action: { type: "toggle-sign" } },
  { label: "%", tone: "utility", action: { type: "percent" } },
  { label: "÷", tone: "operator", action: { type: "set-operator", operator: "divide" } },
  { label: "7", tone: "number", action: { type: "input-digit", digit: "7" } },
  { label: "8", tone: "number", action: { type: "input-digit", digit: "8" } },
  { label: "9", tone: "number", action: { type: "input-digit", digit: "9" } },
  { label: "×", tone: "operator", action: { type: "set-operator", operator: "multiply" } },
  { label: "4", tone: "number", action: { type: "input-digit", digit: "4" } },
  { label: "5", tone: "number", action: { type: "input-digit", digit: "5" } },
  { label: "6", tone: "number", action: { type: "input-digit", digit: "6" } },
  { label: "−", tone: "operator", action: { type: "set-operator", operator: "subtract" } },
  { label: "1", tone: "number", action: { type: "input-digit", digit: "1" } },
  { label: "2", tone: "number", action: { type: "input-digit", digit: "2" } },
  { label: "3", tone: "number", action: { type: "input-digit", digit: "3" } },
  { label: "+", tone: "operator", action: { type: "set-operator", operator: "add" } },
  { label: "0", tone: "number", span: 2, action: { type: "input-digit", digit: "0" } },
  { label: ".", tone: "number", action: { type: "input-decimal" } },
  { label: "=", tone: "equals", action: { type: "evaluate" } }
];

function isErrorState(state: CalculatorState) {
  return state.display === "Error";
}

function countDigits(value: string) {
  return value.replace(/[^0-9]/g, "").length;
}

function parseDisplayValue(display: string) {
  if (display === "Error") {
    return null;
  }

  if (display.endsWith(".")) {
    return Number(display.slice(0, -1));
  }

  return Number(display);
}

function formatDisplayValue(value: number) {
  const normalizedValue = Object.is(value, -0) ? 0 : value;

  if (!Number.isFinite(normalizedValue)) {
    return null;
  }

  if (normalizedValue === 0) {
    return "0";
  }

  const absoluteValue = Math.abs(normalizedValue);

  if (absoluteValue >= 1e10) {
    return null;
  }

  const preciseValue = normalizedValue.toPrecision(10);

  if (preciseValue.includes("e")) {
    return null;
  }

  const trimmedValue = preciseValue.replace(/(\.\d*?[1-9])0+$|\.0+$/u, "$1");

  return trimmedValue === "-0" ? "0" : trimmedValue;
}

function createErrorState(): CalculatorState {
  return {
    ...INITIAL_STATE,
    display: "Error"
  };
}

function applyOperator(left: number, right: number, operator: Operator) {
  switch (operator) {
    case "add":
      return left + right;
    case "subtract":
      return left - right;
    case "multiply":
      return left * right;
    case "divide":
      return right === 0 ? null : left / right;
    default:
      return null;
  }
}

function commitResult(
  leftValue: number,
  rightValue: number,
  operator: Operator,
  nextOperator: Operator | null
) {
  const result = applyOperator(leftValue, rightValue, operator);

  if (result === null) {
    return createErrorState();
  }

  const formattedResult = formatDisplayValue(result);

  if (!formattedResult) {
    return createErrorState();
  }

  const numericResult = Number(formattedResult);

  return {
    display: formattedResult,
    storedValue: nextOperator ? numericResult : null,
    pendingOperator: nextOperator,
    waitingForOperand: nextOperator !== null,
    justEvaluated: nextOperator === null,
    lastOperator: operator,
    lastOperand: rightValue
  };
}

function handleDigitInput(state: CalculatorState, digit: string) {
  if (isErrorState(state)) {
    return {
      ...INITIAL_STATE,
      display: digit
    };
  }

  if (state.waitingForOperand || state.justEvaluated) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
      justEvaluated: false
    };
  }

  if (state.display === "0") {
    return {
      ...state,
      display: digit
    };
  }

  if (state.display === "-0") {
    return {
      ...state,
      display: digit === "0" ? "-0" : `-${digit}`
    };
  }

  if (countDigits(state.display) >= 10) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}${digit}`
  };
}

function handleDecimalInput(state: CalculatorState) {
  if (isErrorState(state)) {
    return {
      ...INITIAL_STATE,
      display: "0."
    };
  }

  if (state.waitingForOperand || state.justEvaluated) {
    return {
      ...state,
      display: "0.",
      waitingForOperand: false,
      justEvaluated: false
    };
  }

  if (state.display.includes(".") || countDigits(state.display) >= 10) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}.`
  };
}

function handleOperatorInput(state: CalculatorState, operator: Operator) {
  if (isErrorState(state)) {
    return state;
  }

  const currentValue = parseDisplayValue(state.display);

  if (currentValue === null) {
    return state;
  }

  if (state.pendingOperator && state.storedValue !== null && !state.waitingForOperand) {
    return commitResult(state.storedValue, currentValue, state.pendingOperator, operator);
  }

  return {
    ...state,
    storedValue: state.storedValue ?? currentValue,
    pendingOperator: operator,
    waitingForOperand: true,
    justEvaluated: false
  };
}

function handleEvaluation(state: CalculatorState) {
  if (isErrorState(state)) {
    return state;
  }

  const currentValue = parseDisplayValue(state.display);

  if (currentValue === null) {
    return state;
  }

  if (state.pendingOperator && state.storedValue !== null) {
    const rightValue = state.waitingForOperand ? state.lastOperand ?? state.storedValue : currentValue;

    return commitResult(state.storedValue, rightValue, state.pendingOperator, null);
  }

  if (state.lastOperator !== null && state.lastOperand !== null) {
    return commitResult(currentValue, state.lastOperand, state.lastOperator, null);
  }

  return state;
}

function handleSignToggle(state: CalculatorState) {
  if (isErrorState(state)) {
    return state;
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: "-0",
      waitingForOperand: false,
      justEvaluated: false
    };
  }

  if (state.display === "0") {
    return {
      ...state,
      display: "-0"
    };
  }

  if (state.display === "0.") {
    return {
      ...state,
      display: "-0."
    };
  }

  if (state.display === "-0" || state.display === "-0.") {
    return {
      ...state,
      display: state.display === "-0" ? "0" : "0."
    };
  }

  return {
    ...state,
    display: state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}`
  };
}

function handlePercent(state: CalculatorState) {
  if (isErrorState(state)) {
    return state;
  }

  const currentValue = parseDisplayValue(state.display);

  if (currentValue === null) {
    return state;
  }

  let percentValue = currentValue / 100;

  if (
    state.storedValue !== null &&
    state.pendingOperator !== null &&
    (state.pendingOperator === "add" || state.pendingOperator === "subtract")
  ) {
    percentValue = state.storedValue * percentValue;
  }

  const formattedValue = formatDisplayValue(percentValue);

  if (!formattedValue) {
    return createErrorState();
  }

  return {
    ...state,
    display: formattedValue,
    waitingForOperand: false,
    justEvaluated: false
  };
}

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "input-digit":
      return handleDigitInput(state, action.digit);
    case "input-decimal":
      return handleDecimalInput(state);
    case "set-operator":
      return handleOperatorInput(state, action.operator);
    case "evaluate":
      return handleEvaluation(state);
    case "toggle-sign":
      return handleSignToggle(state);
    case "percent":
      return handlePercent(state);
    case "clear":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function getButtonClasses(tone: ButtonTone) {
  switch (tone) {
    case "utility":
      return "border-[#616161] bg-[linear-gradient(180deg,#fefefe_0%,#d8d8d8_100%)] text-[#2b2b2b]";
    case "operator":
      return "border-[#5c5f67] bg-[linear-gradient(180deg,#f4f7fb_0%,#b7bec8_100%)] text-[#222a35]";
    case "equals":
      return "border-[#2b4e72] bg-[linear-gradient(180deg,#7fb2de_0%,#4f7fad_100%)] text-white";
    case "number":
    default:
      return "border-[#636363] bg-[linear-gradient(180deg,#ffffff_0%,#d0d0d0_100%)] text-[#1f1f1f]";
  }
}

function CalculatorButton({ definition, isActive, onPress }: CalculatorButtonProps) {
  return (
    <button
      className={[
        "flex h-[40px] items-center justify-center border text-[16px] font-['Chicago'] leading-none shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#8d8d8d] outline-none transition-none active:translate-y-px active:shadow-[inset_1px_1px_0_#8d8d8d,inset_-1px_-1px_0_#ffffff]",
        getButtonClasses(definition.tone)
      ].join(" ")}
      data-active={isActive ? "true" : undefined}
      style={{ gridColumn: `span ${definition.span ?? 1}` }}
      type="button"
      onClick={() => onPress(definition.action)}
    >
      {definition.label}
    </button>
  );
}

export function Calculator(_: AppProps) {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_STATE);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8] p-2 text-[#1f1f1f]">
      <div className="os9-surface-outset flex h-full min-h-0 flex-col gap-2 bg-[#cdcdcd] p-[6px]">
        <div className="os9-surface-inset flex items-end justify-end bg-[linear-gradient(180deg,#f8f8df_0%,#d8d8bf_100%)] px-3 py-2">
          <div
            aria-label="Calculator display"
            className="w-full overflow-hidden text-right font-mono text-[31px] leading-none tracking-[-0.08em] text-[#202020]"
          >
            {state.display}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-[6px]">
          {BUTTONS.map((buttonDefinition) => {
            const isActive =
              buttonDefinition.action.type === "set-operator"
              && state.pendingOperator === buttonDefinition.action.operator
              && state.waitingForOperand;

            return (
              <CalculatorButton
                key={`${buttonDefinition.label}-${buttonDefinition.action.type}`}
                definition={buttonDefinition}
                isActive={isActive}
                onPress={dispatch}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { BuilderState } from "./builder-state";
import { createDefaultBuilderState } from "./builder-state";

export type BuilderAction =
  | { readonly type: "RESET" }
  | { readonly type: "SET_STATE"; readonly state: BuilderState }
  | {
      readonly type: "UPDATE_STATE";
      readonly partial: Partial<BuilderState>;
    }
  | {
      readonly type: "UPDATE_STAGE_FIELD";
      readonly stage: keyof BuilderState;
      readonly value: unknown;
    };

export interface BuilderStore {
  readonly state: BuilderState;
  readonly dispatch: (action: BuilderAction) => void;
}

const BuilderContext = createContext<BuilderStore | null>(null);

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "RESET":
      return createDefaultBuilderState();
    case "SET_STATE":
      return action.state;
    case "UPDATE_STATE":
      return { ...state, ...action.partial };
    case "UPDATE_STAGE_FIELD":
      return { ...state, [action.stage]: action.value };
    default:
      return state;
  }
}

export interface BuilderProviderProps {
  readonly children: ReactNode;
  readonly initialState?: BuilderState;
}

export function BuilderProvider({ children, initialState }: BuilderProviderProps) {
  const [state, dispatch] = useReducer(builderReducer, initialState ?? createDefaultBuilderState());
  return <BuilderContext.Provider value={{ state, dispatch }}>{children}</BuilderContext.Provider>;
}

export function useBuilderState(): BuilderState {
  const store = useContext(BuilderContext);
  if (store === null) {
    throw new Error("useBuilderState must be used within a BuilderProvider.");
  }
  return store.state;
}

export function useBuilderDispatch(): (action: BuilderAction) => void {
  const store = useContext(BuilderContext);
  if (store === null) {
    throw new Error("useBuilderDispatch must be used within a BuilderProvider.");
  }
  return store.dispatch;
}

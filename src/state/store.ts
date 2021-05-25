import {createStore, combineReducers} from 'redux'
import produce from 'immer'

export enum ActionType {
  ADD_SNIPPET = 'ADD_SNIPPET',
  REMOVE_SNIPPET = 'REMOVE_SNIPPET',
  UPDATE_SNIPPET_TEXT = 'UPDATE_SNIPPET_TEXT',
  UPDATE_COMBINATOR = 'UPDATE_COMBINATOR'
}

type Action = { type: ActionType }

export type AddSnippetAction = Action
export type RemoveSnippetAction = Action
export type UpdateSnippetAction = Action & { text: string, index: number }
export type UpdateCombinatorAction = Action & { combinator: string, index: number }

export type State = { selector: SelectorSnippet[] }

export type SelectorSnippet = { text: string, combinator: string }

const selectorReducer =
  produce<(s: SelectorSnippet[], a: Action) => SelectorSnippet[]>(
    (draft, action) => {
      switch (action.type) {
        case ActionType.ADD_SNIPPET:
          draft.push({text: '', combinator: ''})
          break
        case ActionType.REMOVE_SNIPPET:
          draft.pop()
          break
        case ActionType.UPDATE_SNIPPET_TEXT:
          const typedAction = action as UpdateSnippetAction
          draft[typedAction.index].text = typedAction.text
          break
        case ActionType.UPDATE_COMBINATOR:
          const typedUpdateCombinatorAction = action as UpdateCombinatorAction
          draft[typedUpdateCombinatorAction.index].combinator =
            typedUpdateCombinatorAction.combinator
      }
    },
    []
  )

const reducer = combineReducers({selector: selectorReducer})
export const store = createStore(reducer)


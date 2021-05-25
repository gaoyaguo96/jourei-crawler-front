import React from 'react'
import {
  ActionType,
  State,
  UpdateCombinatorAction,
  UpdateSnippetAction
} from '../state/store'
import {connect, ConnectedProps} from 'react-redux'
import '../css/index.scss'

const connector = connect(
  (state: State) => ({selector: state.selector}),
  {
    updateSnippetText: (text: string, index: number): UpdateSnippetAction =>
      ({type: ActionType.UPDATE_SNIPPET_TEXT, text: text, index: index}),
    updateCombinator: (combinator: string, index: number): UpdateCombinatorAction =>
      ({
        type: ActionType.UPDATE_COMBINATOR,
        combinator: combinator,
        index: index
      })
  }
)

type OwnProps = {}
type Props = OwnProps & ConnectedProps<typeof connector>

export default connector(Selectors)

function Selectors(props: Props) {
  return (
    <>
      {
        props.selector.map((snippet, index) =>
          (
            <>
              <li className="selector-snippet" key={index}>
                <input
                  type="text"
                  value={snippet.text}
                  onChange={e => {
                    props.updateSnippetText(e.target.value, index)
                  }}
                />
              </li>
              {
                index >= props.selector.length - 1
                  ? '' : (
                    <select
                      className="selector"
                      defaultValue=" "
                      onChange={e =>
                        props.updateCombinator(e.target.value, index)
                      }
                    >
                      <option value=">">{'>'}</option>
                      <option value=" ">{' '}</option>
                      <option value="+">+</option>
                    </select>
                  )
              }
            </>
          )
        )
      }
    </>
  )
}

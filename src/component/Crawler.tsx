import React from 'react'
import {ErrorMessage, Field, FieldArray, Form, Formik} from 'formik'
import {SelectorSnippet} from '../state/store'
import {Subject} from 'rxjs'
import {map, mergeMap, retry, throttleTime} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'
import Ajv, {JSONSchemaType} from 'ajv'
import {set} from 'lodash/fp'
import {toDotPath} from '../util/ObjectPathUtils'

export default function Crawler() {
  return (
    <Formik
      initialValues={{
        url: '',
        selector: []
      }}
      validate={validate}
      onSubmit={values => {
        ajaxHtmlSubject.next([values.url, values.selector])
      }}
    >
      {({values, errors}) => (
        <Form>
          <label htmlFor="url">URL</label>
          <Field name="url"/>
          <ErrorMessage name="url"/>
          <FieldArray name="selector">
            {({remove, push}) =>
              <div>
                {
                  values.selector.map((snippet, index) => (
                    <div key={index}>
                      <Field name={`selector.${index}.text`}/>
                      <ErrorMessage name={`selector[${index}].text`}/>
                      <Field
                        name={`selector.${index}.combinator`}
                        as="select"
                        defaultValue=" "
                      >
                        <option value=">">{'>'}</option>
                        <option value=" ">{' '}</option>
                        <option value="+">{'+'}</option>
                      </Field>
                      <ErrorMessage name={`selector[${index}].combinator`}/>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                      >
                        -
                      </button>
                    </div>
                  ))
                }
                <button
                  type="button"
                  onClick={() => {
                    push({text: '', combinator: ''})
                  }}
                >
                  +
                </button>
                <button type="submit">Submit</button>
              </div>
            }
          </FieldArray>
          {
            'string' === typeof errors.selector ?
              <ErrorMessage name="selector"/> : null
          }

        </Form>
      )}
    </Formik>
  )
}

type Fields = {
  url: string,
  selector: SelectorSnippet[]
}

function validate(values: Fields) {
  const validate = new Ajv().compile(schema)
  validate(values)

  return validate.errors?.reduce(
    (obj, error) => set(toDotPath(error.instancePath))(error.message)(obj),
    {}
  ) ?? {}
}

const ajaxHtmlSubject = new Subject<[string, SelectorSnippet[]]>()
ajaxHtmlSubject
  .pipe(
    throttleTime(1000),
    map(([url, selectorSnippets]) => [url, toString(selectorSnippets)]),
    mergeMap(([url, selector]) => ajaxHtml(url, selector)),
    retry()
  )
  .subscribe(next => console.log('结果', next)
  )

function toString(selectorSnippets: SelectorSnippet[]) {
  return selectorSnippets.reduce((selector, snippet) => {
    const trimmed = snippet.text.trim()
    return selector + (trimmed ? trimmed + snippet.combinator : trimmed)
  }, '').replace(/^(.*), *$/, '$1')
}

function ajaxHtml(url: string, selector: string) {
  return ajax(
    {
      url: 'http://localhost:8888/get'
        + '?url='
        + encodeURIComponent(url)
        + '&selector='
        + encodeURIComponent(selector),
      crossDomain: true,
      headers: {'origin': 'localhost:3000'}
    }
  )
}

// @ts-ignore
const schema: JSONSchemaType<Fields> = {
  type: 'object',
  required: ['url', 'selector'],
  properties: {
    url: {
      type: 'string',
      minLength: 1
    },
    selector: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            minLength: 1
          },
          combinator: {
            type: 'string',
            pattern: '^[ >+]$'
          }
        }
      }
    }
  }
}

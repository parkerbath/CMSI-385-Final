import { NFA, concatenation, NFAStar, orNFA,NFARegex, deepCopyNFA,} from '../src/NFABuilder.js'
import { deepStrictEqual, throws} from 'assert'
import {regex2NFA} from '../src/regex.js'
const lambda = 'Y'

describe('NFA Tests', () => {
  it('Test #1', ()=>{
    const expression = '0'
    const expressionNFA = NFARegex(expression)
    deepStrictEqual(expressionNFA.validateString('0') , true)
    deepStrictEqual(expressionNFA.validateString('00') , false)
    const expression1 = '1'
    const expression1NFA = NFARegex(expression1)
    deepStrictEqual(expression1NFA.validateString('1') , true)
    deepStrictEqual(expression1NFA.validateString('11') , false)
  })
  it('Text #2', () => {
    let change0 = [
      {start: 'a', end:'b', symbol: '0'}
    ]
    let start0 = 'a'
    let end0 = ['b']
    let change1 = [
      {start: 'aa', end:'bb', symbol: '1'}
    ]
    let start1 = 'aa'
    let end1 = ['bb']
    let nfa1 = new NFA(change0, end0, start0)
    const nfa2 = new NFA(change1, end1, start1)
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa2.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('00') , false)
    deepStrictEqual(nfa2.validateString('11') , false)
    const cNFA = concatenation(nfa1, nfa2)
    deepStrictEqual(cNFA.validateString('0') , false)
    deepStrictEqual(nfa2.validateString('1') , true)
    deepStrictEqual(cNFA.validateString('01') , true)
    deepStrictEqual(cNFA.validateString('00') , false)
    deepStrictEqual(nfa2.validateString('11') , false)

  })
  it('test #3', ()=>{
    let change0 = [
      {start: 'a', end:'b', symbol: '0'}
    ]
    let start0 = 'a'
    let end0 = ['b']
    let change1 = [
      {start: 'aa', end:'bb', symbol: '1'}
    ]
    let start1 = 'aa'
    let end1 = ['bb']
    const nfa1 = new NFA(change0, end0, start0) //0
    const nfa2 = new NFA(change1, end1, start1) //1
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa2.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('00') , false)
    deepStrictEqual(nfa2.validateString('11') , false)
    const concatThenOr = orNFA(concatenation(nfa1, nfa2), nfa2)
    deepStrictEqual(concatThenOr.validateString('0') , false)
    deepStrictEqual(concatThenOr.validateString('1') , true)
    deepStrictEqual(concatThenOr.validateString('01') , true)
    deepStrictEqual(concatThenOr.validateString('00') , false)
  })
  it('Test #4', ()=>{
    const testingOr = () =>{
      let change0 = [
      {start: 'a', end:'b', symbol: '0'}
      ]
      let start0 = 'a'
      let end0 = ['b']
      let change1 = [
        {start: 'aa', end:'bb', symbol: '1'}
      ]
      let start1 = 'aa'
      let end1 = ['bb']
      let nfa1 = new NFA(change0, end0, start0)
      const nfa2 = new NFA(change1, end1, start1)
      nfa1 = orNFA(nfa1, nfa2)
      return nfa1
    }
    let nfa1 = testingOr()
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa1.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('01') , false)
    deepStrictEqual(nfa1.validateString('10') , false)
  })

  it('Test #5', ()=>{
    const expression0 = '0'
    const expression0NFA = NFARegex(expression0)
    const expression1 = '1'
    const expression1NFA = NFARegex(expression1)
    deepStrictEqual(expression0NFA.validateString('0') , true)
    deepStrictEqual(expression1NFA.validateString('1') , true)
    const expression0orexpression1NFA = orNFA(expression0NFA, expression1NFA)
    deepStrictEqual(expression0orexpression1NFA.validateString('0') , true)
    deepStrictEqual(expression0orexpression1NFA.validateString('1') , true)
    deepStrictEqual(expression0orexpression1NFA.validateString('00') , false)
    deepStrictEqual(expression0orexpression1NFA.validateString('11') , false)
    deepStrictEqual(expression0orexpression1NFA.validateString('01') , false)
    deepStrictEqual(expression0orexpression1NFA.validateString('10') , false)
    const expressionConcatenation = concatenation(expression0NFA, expression1NFA)
    deepStrictEqual(expressionConcatenation.validateString('01') , true)
    deepStrictEqual(expressionConcatenation.validateString('11') , false)

  })
  it('test #6', ()=>{
    const testingOr = () =>{
      let change0 = [
      {start: 'a', end:'b', symbol: '0'}
      ]
      let start0 = 'a'
      let end0 = ['b']
      let change1 = [
        {start: 'aa', end:'bb', symbol: '1'}
      ]
      let start1 = 'aa'
      let end1 = ['bb']
      let nfa1 = new NFA(change0, end0, start0)
      const nfa2 = new NFA(change1, end1, start1)
      nfa1 = orNFA(nfa1, nfa2)
      return nfa1
    }
    let nfa1 = testingOr()
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa1.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('01') , false)
    deepStrictEqual(nfa1.validateString('10') , false)
  })

  it('Test #7', ()=>{
    let change0 = [
      {start: 'a', end:'b', symbol: '0'},
      {start: 'b', end: 'c', symbol: '0'},
      {start: 'a', end: 'b', symbol: lambda},
    ]
    let start0 = 'a'
    let end0 = ['c']
    let change1 = [
      {start: 'a', end:'b', symbol: '1'},
      {start: 'b', end: 'c', symbol: '1'},
      {start: 'a', end: 'b', symbol: lambda},
    ]
    let start1 = 'a'
    let end1 = ['c']
    let nfa1 = new NFA(change0, end0, start0)
    const nfa2 = new NFA(change1, end1, start1)
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa1.validateString('00') , true)
    deepStrictEqual(nfa1.validateString('000') , false)
    deepStrictEqual(nfa2.validateString('1') , true)
    deepStrictEqual(nfa2.validateString('11') , true)
    deepStrictEqual(nfa2.validateString('111') , false)
    nfa1 = concatenation(nfa1, nfa2)
    deepStrictEqual(nfa1.validateString('01') , true)
    deepStrictEqual(nfa1.validateString('0011') , true)
    deepStrictEqual(nfa1.validateString('0') , false)
    deepStrictEqual(nfa1.validateString('1') , false)
    deepStrictEqual(nfa2.validateString('1') , true)


  })
  it('Test #8', ()=>{
    const testConcatScope = () =>{
      let change0 = [
      {start: 'a', end:'b', symbol: '0'}
      ]
      let start0 = 'a'
      let end0 = ['b']

      let change1 = [
        {start: 'aa', end:'bb', symbol: '1'}
      ]
      let start1 = 'aa'
      let end1 = ['bb']

      let nfa1 = new NFA(change0, end0, start0)
      const nfa2 = new NFA(change1, end1, start1)

      nfa1 = concatenation(nfa1, nfa2)
      return nfa1
    }

    let nfa1 = testConcatScope()

    deepStrictEqual(nfa1.validateString('0') , false)
    deepStrictEqual(nfa1.validateString('01') , true)

  })
  it('Test #9', ()=>{

    let change = [
      {start: 'a', end:'b', symbol: '0'}
    ]
    let start = 'a'
    let end = ['b']
    const nfa = new NFA(change, end, start)

    const nfa1 = NFAStar(nfa)

    deepStrictEqual(nfa1.validateString('') , true)
    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa1.validateString('00') , true)
  })
  it('Test #10', () => {

    let change0 = [
      {start: 'a', end:'b', symbol: '0'}
    ]
    let start0 = 'a'
    let end0 = ['b']

    let change1 = [
      {start: 'aa', end:'bb', symbol: '1'}
    ]
    let start1 = 'aa'
    let end1 = ['bb']

    let nfa1 = new NFA(change0, end0, start0)
    const nfa2 = new NFA(change1, end1, start1)

    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa2.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('00') , false)
    deepStrictEqual(nfa2.validateString('11') , false)

    nfa1 = orNFA(nfa1, nfa2)

    deepStrictEqual(nfa1.validateString('0') , true)
    deepStrictEqual(nfa1.validateString('1') , true)
    deepStrictEqual(nfa1.validateString('11') , false)
    deepStrictEqual(nfa1.validateString('00') , false)

  })
})


describe('Regular Expressions testing', () => {
  it('Test #1', ()=>{
    const n = regex2NFA('0')
    deepStrictEqual(n.validateString('0') , true)
    deepStrictEqual(n.validateString('00') , false)
  })
  it('Test #2', ()=>{
    const n = regex2NFA('0+1')
    deepStrictEqual(n.validateString('0') , true)
    deepStrictEqual(n.validateString('1') , true)
    deepStrictEqual(n.validateString('00') , false)
    deepStrictEqual(n.validateString('11') , false)
  })
  it('Test #3', ()=>{
    const n = regex2NFA('01+1')
    deepStrictEqual(n.validateString('0') , false)
    deepStrictEqual(n.validateString('1') , true)
    deepStrictEqual(n.validateString('00') , false)
    deepStrictEqual(n.validateString('11') , false)
    deepStrictEqual(n.validateString('01') , true)
  })
  it('Test #4', ()=>{
    const n = regex2NFA('0(0+1*)* + 1*00+1')
    deepStrictEqual(n.validateString('01') , true)
    deepStrictEqual(n.validateString('00') , true)
    deepStrictEqual(n.validateString('010') , true)
    deepStrictEqual(n.validateString('01111') , true)
    deepStrictEqual(n.validateString('00') , true)
    deepStrictEqual(n.validateString('1') , true)
    deepStrictEqual(n.validateString('111111111100') , true)
    deepStrictEqual(n.validateString('11') , false)
    deepStrictEqual(n.validateString('1000') , false)
  })
  it('Test #5', ()=>{
    const n = regex2NFA('0*')
    deepStrictEqual(n.validateString('0') , true)
    deepStrictEqual(n.validateString('') , true)
    deepStrictEqual(n.validateString('00') , true)
  })
  it('Test #6', ()=>{
    const n = regex2NFA('0+1*')
    deepStrictEqual(n.validateString('1') , true)
    deepStrictEqual(n.validateString('0') , true)
    deepStrictEqual(n.validateString('111111') , true)
    deepStrictEqual(n.validateString('00001') , false)
  })
  it('Test #7', ()=>{
    const n = regex2NFA('(01)*')
    deepStrictEqual(n.validateString('01') , true)
    deepStrictEqual(n.validateString('0') , false)
    deepStrictEqual(n.validateString('0111111') , false)
    deepStrictEqual(n.validateString('00001') , false)
    deepStrictEqual(n.validateString('01010101') , true)
    deepStrictEqual(n.validateString('') , true)
  })
})

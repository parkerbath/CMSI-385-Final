import { concatenation, NFAStar, orNFA, NFARegex,} from './NFABuilder.js'

const regex2NFA = function(expression){
  while(expression.includes(' '))
    expression = expression.replace(' ', '').replace('.','');
  return parsingRegex(expression)
}
const parsingRegex = function(expression){
  if(expression[0] === '(' && expression[expression.length-1] === ')')
      expression = expression.substring(1,expression.length-1)
  if(expression.length === 1)
      return NFARegex(expression)
  
  return parsingOr(expression)
}

const parsingOr = function(expression){
  let split = parsingOrHelper(expression, '+')
  //convert to nfas 
  split = split.map( (currExpression) =>{
    if(currExpression[0] === '(' && currExpression[currExpression.length-1] === ')')
      return parsingRegex(currExpression)
    else
      return parsingRegexConcat(currExpression)
  })
  let result = split[0]
  for(let i =1 ; i < split.length; i++){
    result = orNFA(result, split[i])
  }
  return result
}


const parsingStar = function(expression){
  const preStar = parsingRegex(expression.substring(0,expression.length-1))
  return NFAStar(preStar)
}

const parsingRegexConcat = function(expression){
  let split = concatenatingHelper(expression)
  split = split.map( (currExpression) => {
    if(currExpression[0] === '(' && currExpression[currExpression.length-1] === ')')
      return parsingRegex(currExpression)
    else if(currExpression[currExpression.length-1] === '*')
    {
      return parsingStar(currExpression)
    }
    else
      return NFARegex(currExpression)
  })

  //merge nfas
  let result = split[0]
  for (let i = 1 ; i < split.length; i++) {
    result = concatenation(result, split[i])
  }
  return result
}

const concatenatingHelper = function(expression) {

  const result=[] //strings split UNLESS parentheses
  let count = 0
  let subset = ''
  let i = 0
  while(i < expression.length){
    const currChar = expression[i]
    if(currChar === '(') count++
    else if(currChar === ')') count--
    
    subset += currChar

    if(count===0)
    { 
      if(i+1 < expression.length && expression[i+1] === '*')
      {
        subset += expression[i+1]
        i++
      }
      result.push(subset)
      subset=''
    }
    i++
  }

  if(subset !== '')
    result.push(subset)

  return result

}
const parsingOrHelper = function(expression, sym='+') {
  const result = []
  let count = 0
  let subset = ''
let i = 0
  while(i < expression.length){
    const currChar = expression[i]
    if(currChar === '(') {
      count++
    } else if(currChar === ')') {
      count--
    }
    if(count===0 && currChar === sym){
      if(i+1 < expression.length && expression[i+1] === '*')
      {
        subset += expressions[i+1]
        i++
      }
      result.push(subset)
      subset = ''
    } else {
      subset += currChar
    }
    i++
  }
  if(subset !== '')
    result.push(subset)

  return result
}

export {
  regex2NFA
}

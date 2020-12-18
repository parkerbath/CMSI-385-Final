const lambda = 'Y'

class node {
  constructor(name) {
    this.name = name
    this.transitions = []
  }
  //creating edges
  createTransition(nextNode, symbol) {
    const newTransition = { symbol: symbol, nextNode: nextNode }
    this.transitions.push(newTransition)
  }
  removelambdaNodes(){
    this.transitions = this.transitions.filter(({nextNode, symbol}) => !(nextNode === this && symbol === lambda))
  }
  //Returns an array of nodes 
  transition(transitionSymbol) {
    return this.transitions
      .filter(({ symbol }) => symbol === transitionSymbol)
      .map(({nextNode}) => nextNode)
  }
}

class NFA {
  constructor(transitions, statesAccepted, start) {
    if(typeof start === 'object'){
      try{
        start = start[0]
        if(start == undefined){
          throw {message:'invalid start node datatype'}
        }
      }catch(err){
        throw {message:'invalid start node datatype'}
      }
    }
    if(transitions === undefined || statesAccepted === undefined || start === undefined){
      throw {message:'Null is not accepted as an argument'}
    }
    if(transitions === null || statesAccepted === null || start === null){
      throw {message:'Null is not accepted as an argument'}
    }
    this.alphabet = [
      ...new Set(transitions.map(({ symbol }) => symbol).filter((symbol)=>symbol!==lambda)),
    ]
    const nameOfNodes = [
      ...new Set(transitions.flatMap(({ start, end }) => [start, end])),
    ]
    //instantiating and object for each of the nodes
    this.nodes = nameOfNodes.map((name) => new node(name))
    //adding transition function
    transitions.forEach(({ start, end, symbol }) => {
      this.nodes
        .find(({ name }) => name === start)
        .createTransition(
          this.nodes.find(({ name }) => name === end),
          symbol
        )
    })
    this.start = this.nodes.find(({name}) => name === start)
    this.accepted = this.nodes.filter(({ name }) =>
      statesAccepted.includes(name)
    )
  }

  getnexts (transitionSymbol, currentNode) {
    const adjacentByLambda = this.getAdjacentLambdaNodes(currentNode, [])
    let stack = []
    adjacentByLambda.forEach((node)=>{
      const adjacentBySymbol = node.transition(transitionSymbol)
      stack = [...new Set([...stack, ...adjacentBySymbol])]
    })
    return stack
  }

  getAdjacentLambdaNodes(currentNode, stack){
    stack.push(currentNode)
    const recurseStack = currentNode.transition(lambda).filter((node)=>!stack.includes(node))
                        .filter((node)=>node !== undefined)
    if(recurseStack.length > 0){
      recurseStack.forEach((node)=>{
        stack = this.getAdjacentLambdaNodes(node, stack)
      })
    }
    return stack
  }
  end (currentNode)  {
    if(currentNode === undefined) return false
    const isAccept = this.accepted.includes(currentNode)
    if(!isAccept){
      const nexts = this.getAdjacentLambdaNodes(currentNode, [])
        for(let state in nexts){
          if(this.accepted.includes(nexts[state])){
            return true
          }
        }
    }
    return isAccept
  }

  acceptString (currstr, currentNode) {
    if (currstr.length === 0){
      return this.end(currentNode);
    }
    if (!this.alphabet.includes(currstr[0]) && currstr[0] !== lambda){
      throw {message:'please choose a symbol in the alphabet'}
    }
    const nexts = this.getnexts(currstr[0], currentNode)
    if (nexts.length === 0 || !nexts){ 
      return false
    }
    for(let i = 0; i < nexts.length; i++){
      if(this.acceptString(currstr.substring(1), nexts[i]))
        return true
    }
    return false
  }

  validateString (currstr) {
    return this.acceptString(currstr, this.start) === true
  }
}
export { NFA, node }

const deepCopyNFA = function(nfa){

  const result = emptyNFA()
  result.alphabet = [...nfa.alphabet]

  result.nodes = []
  result.accepted = []

  const Table = {
    firstTable:[],
    secondTable:[],
    set (C, D){
      this.firstTable.push(C)
      this.secondTable.push(D)
    },
    get (C){
      for(let i = 0; i < this.firstTable.length && i < this.secondTable.length; i ++){
        if(this.firstTable[i] === C)
          return this.secondTable[i] 
      }
      return undefined
    },
  }
  const lookup = function(currentNode){
    return Table.get(currentNode)
  }
  //Create the nodes of the graph
  nfa.nodes.forEach((NFANode)=>{
    const resultNode = new node(NFANode.name)
    result.nodes.push(resultNode)
    Table.set(NFANode, resultNode)
  })
  nfa.nodes.forEach((NFANode)=>{
    NFANode.transitions.forEach((transition)=>{
      lookup(NFANode).createTransition(lookup(transition.nextNode), transition.symbol)
    })
  })
  result.start = lookup(nfa.start)
  nfa.accepted.forEach((node)=>{
    result.accepted.push(lookup(node))
  })
  return result
}

const NFARegex = function(expression){
  const change = [
    {start: ``, end:expression, symbol:expression }
  ]
  const startState = ``
  const endState = [expression]

  return new NFA(change, endState, startState)

}

const emptyNFA = function() {
  const nfa = new NFA([''], [''], [''])
  nfa.start = undefined
  nfa.accepted =undefined
  nfa.nodes = undefined
  nfa.alphabet = undefined
  return nfa
}

const concatenation = function(a, b){
  const nfa1 = deepCopyNFA(a);
  const nfa2 = deepCopyNFA(b);
  nfa1.nodes.push(...nfa2.nodes)
  nfa1.accepted.forEach((node)=>{
    node.createTransition(nfa2.start, lambda)
  })
  nfa1.accepted = [...nfa2.accepted]
  nfa1.alphabet = [...new Set([...nfa1.alphabet, ...nfa2.alphabet]),]
  return nfa1
}

const NFAStar = function(a){
  const result = deepCopyNFA(a)
  const lambdaNode = new node('')

  lambdaNode.createTransition(result.start, lambda)

  result.nodes.push(lambdaNode)
  result.start = lambdaNode
  result.accepted.map((node)=>{
    node.createTransition(result.start, lambda)
  })
  result.accepted.push(result.start)

  return result
}

const orNFA = function(a, b){
  const lambdaNode = new node('')
  const nfa1 = deepCopyNFA(a)
  const nfa2 = deepCopyNFA(b)
  lambdaNode.createTransition(nfa1.start, lambda)
  lambdaNode.createTransition(nfa2.start, lambda)
  nfa1.nodes.push(lambdaNode)
  nfa1.nodes.push(...nfa2.nodes)
  nfa1.start = lambdaNode  
  nfa1.alphabet = [...new Set([...nfa1.alphabet, ...nfa2.alphabet]),]
  nfa1.accepted.push(...nfa2.accepted)
  return nfa1
}

export {
  emptyNFA,
  NFARegex,
  concatenation,
  NFAStar,
  orNFA,
  deepCopyNFA,
}

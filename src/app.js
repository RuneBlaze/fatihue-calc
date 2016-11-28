import {div, h1, h2, h3, h, form, input, blockquote, p, button, ul, li} from '@cycle/dom'
import xs from 'xstream'
const fatihue = require('fatihue')

function mkIntSg(sources, kw) {
  return sources.DOM.select(kw).events('input').map(ev => parseInt(ev.target.value)).startWith(0)
}

export function App (sources) {
  const p1S$ = mkIntSg(sources, '#p1S')
  const p1F$ = mkIntSg(sources, '#p1F')
  const p2S$ = mkIntSg(sources, '#p2S')
  const p2F$ = mkIntSg(sources, '#p2F')

  const brann$ = sources.DOM.select('#brann').events('click').startWith(false).mapTo('brann')
  const coldlight$ = sources.DOM.select('#coldlight').events('click').startWith(false).mapTo('coldlight')
  const gangup$ = sources.DOM.select('#gangup').events('click').startWith(false).mapTo('gangup')
  const clear$ = sources.DOM.select('#clear').events('click').startWith(false).mapTo('clear')

  const buttons$ = xs.merge(brann$, coldlight$, gangup$, clear$)

  const actionList$ = buttons$.fold((l, r) => r === 'clear' ? [] : l.concat(r), [])

  const parameters$ = xs.combine(p1S$, p1F$, p2S$, p2F$)

  const res$ = xs.combine(parameters$,actionList$)

  const fatihue$ = res$.map(([[a, b, c, d], actions]) => [[a, b, c, d], actions, fatihue(a,b,c,d,actions)])

  const sinks = {
    DOM: fatihue$.map( ([[a, b, c, d], actions, {p1Dmg, p2Dmg, p2FutureDmg}]) =>
      div('.container', [
        h1('Hearthstone Mill Rogue Lethal Calculator'),
        p ('This calculator helps the inexperienced mill rogue players (like me) determine lethal.'),
        p ('All number parameters are by default 0.'),
        blockquote('"My hand is full!" -- Your Opponent'),
        blockquote('"I am almost out of card." -- Tyrande Whisperwind (2016)'),
        h('a', {attrs: {href: 'https://github.com/RuneBlaze/fatihue-calc'}}, ['Github']),
        h2('Inputs'),
        h3('Your Info'),
        input('#p1S', {attrs: {type: 'number', placeholder: 'deck size'}}),
        input('#p1F', {attrs: {type: 'number', placeholder: 'fatigue tick'}}),
        h3('Opponent Info'),
        input('#p2S', {attrs: {type: 'number', placeholder: 'deck size'}}),
        input('#p2F', {attrs: {type: 'number',  placeholder: 'fatigue tick'}}),
        h3('Play Sequence'),
        button('#brann', 'Brann'),
        button('#coldlight', 'Coldlight'),
        button('#gangup', 'Gangup'),
        button('#clear', '*Clear Sequence*'),
        ul(actions.map(it => li(it))),
        h2('Result'),
        ul([
          li('Damage to Opponent (this turn): ' + p2Dmg),
          li('Damage to You (this turn): ' + p1Dmg),
          li('Damage to Opponent (start of next turn): ' + p2FutureDmg)
        ])
      ])
    )
  }
  return sinks
}

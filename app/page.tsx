'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, RotateCcw, Square, Home, Plus, Play, Moon, Sun } from 'lucide-react'

// Types
interface Player {
  id: number
  name: string
  color: string
  scores: Record<string, number | null>
}

interface Game {
  id: number
  players: Player[]
  date: string
  completed: boolean
  winner?: Player
}

interface Category {
  name: string
  key: string
}

interface ScoreDialog {
  category: Category
  playerIndex: number
}

interface ScoreOption {
  count: string | number
  points: number
  label?: string
}

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const prevValue = prevValueRef.current
    const difference = value - prevValue
    
    if (difference !== 0) {
      setIsAnimating(true)
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.round(prevValue + (difference * easeOutQuart))
        
        setDisplayValue(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }
      
      requestAnimationFrame(animate)
    } else {
      setDisplayValue(value)
    }
    
    prevValueRef.current = value
  }, [value, duration])

  return (
    <span className={`transition-all duration-300 ${isAnimating ? 'text-yellow-400 scale-110' : ''}`}>
      {displayValue}
    </span>
  )
}

export default function EscaleroApp() {
  const [currentPage, setCurrentPage] = useState<'home' | 'setup' | 'game'>('home')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [players, setPlayers] = useState<Array<{ name: string; id: number }>>([])
  const [gameHistory, setGameHistory] = useState<Game[]>([])
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [scoreDialog, setScoreDialog] = useState<ScoreDialog | null>(null)
  const [scoreAnimation, setScoreAnimation] = useState<string | null>(null)
  const [historyDialog, setHistoryDialog] = useState<Game | null>(null)

  const playerColors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600', 
    'from-red-500 to-pink-600',
    'from-yellow-500 to-orange-600',
    'from-indigo-500 to-blue-600',
    'from-purple-500 to-pink-600'
  ]

  const categories: Category[] = [
    { name: '9', key: 'nines' },
    { name: '10', key: 'tens' },
    { name: 'Jack', key: 'jacks' },
    { name: 'Queen', key: 'queens' },
    { name: 'King', key: 'kings' },
    { name: 'Ace', key: 'aces' },
    { name: 'Straight', key: 'straight' },
    { name: 'Full', key: 'full' },
    { name: 'Poker', key: 'poker' },
    { name: 'Grande', key: 'grande' }
  ]

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : ''
  }, [isDarkMode])

  const isGameComplete = (game: Game | null): boolean => {
    if (!game) return false
    return game.players.every(player => 
      categories.every(category => player.scores[category.key] !== null)
    )
  }

  const getSortedPlayers = (game: Game | null): Player[] => {
    if (!game) return []
    return [...game.players].sort((a, b) => getPlayerTotal(b) - getPlayerTotal(a))
  }

  const getPlayerTotal = (player: Player): number => {
    return Object.values(player.scores)
      .filter((score): score is number => score !== null)
      .reduce((sum, score) => sum + score, 0)
  }

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { name: '', id: Date.now() }])
    }
  }

  const updatePlayerName = (id: number, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p))
  }

  const removePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id))
  }

  const startGame = () => {
    if (players.length === 0) return
    
    const gameData: Game = {
      id: Date.now(),
      players: players.map((p, index) => ({
        ...p,
        name: p.name || `Player ${index + 1}`,
        color: playerColors[index],
        scores: categories.reduce((acc, cat) => ({ ...acc, [cat.key]: null }), {})
      })) as Player[],
      date: new Date().toLocaleDateString(),
      completed: false
    }
    
    setCurrentGame(gameData)
    setGameHistory(prev => [gameData, ...prev.filter(g => g.id !== gameData.id)])
    setCurrentPage('game')
  }

  const updateGameInHistory = (updatedGame: Game) => {
    setGameHistory(prev => prev.map(game => 
      game.id === updatedGame.id ? updatedGame : game
    ))
  }

  const openScoreDialog = (category: Category, playerIndex: number) => {
    setScoreDialog({ category, playerIndex })
  }

  const setScore = (points: number) => {
    if (!scoreDialog || !currentGame) return
    
    const { category, playerIndex } = scoreDialog
    const updatedGame = { ...currentGame }
    updatedGame.players[playerIndex].scores[category.key] = points
    
    if (isGameComplete(updatedGame)) {
      updatedGame.completed = true
      updatedGame.winner = getSortedPlayers(updatedGame)[0]
    }
    
    setScoreAnimation(`${category.key}-${playerIndex}`)
    setTimeout(() => setScoreAnimation(null), 600)
    
    setCurrentGame(updatedGame)
    updateGameInHistory(updatedGame)
    setScoreDialog(null)
  }

  const restartGame = () => {
    if (currentGame) {
      const resetGame = {
        ...currentGame,
        players: currentGame.players.map(p => ({
          ...p,
          scores: categories.reduce((acc, cat) => ({ ...acc, [cat.key]: null }), {})
        })),
        completed: false,
        winner: undefined
      }
      setCurrentGame(resetGame)
      updateGameInHistory(resetGame)
    }
  }

  const finishGame = () => {
    if (currentGame) {
      const completedGame = {
        ...currentGame,
        completed: true,
        winner: getSortedPlayers(currentGame)[0]
      }
      updateGameInHistory(completedGame)
      setCurrentGame(null)
      setCurrentPage('home')
    }
  }

  const continueGame = (game: Game) => {
    setCurrentGame(game)
    setCurrentPage('game')
  }

  const playAgain = () => {
    setCurrentPage('setup')
    setPlayers(currentGame?.players.map(p => ({ name: p.name, id: Date.now() + Math.random() })) || [])
    setCurrentGame(null)
  }

  const addPlayerToGame = () => {
    if (currentGame && currentGame.players.length < 6) {
      const newPlayer: Player = {
        id: Date.now(),
        name: `Player ${currentGame.players.length + 1}`,
        color: playerColors[currentGame.players.length],
        scores: categories.reduce((acc, cat) => ({ ...acc, [cat.key]: null }), {})
      }
      setCurrentGame({
        ...currentGame,
        players: [...currentGame.players, newPlayer]
      })
    }
  }

  const removePlayerFromGame = (playerId: number) => {
    if (currentGame && currentGame.players.length > 1) {
      setCurrentGame({
        ...currentGame,
        players: currentGame.players.filter(p => p.id !== playerId)
      })
    }
  }

  const deleteGameFromHistory = (gameId: number) => {
    setGameHistory(prev => prev.filter(game => game.id !== gameId))
    setHistoryDialog(null)
  }

  const playAgainFromHistory = (game: Game) => {
    setCurrentPage('setup')
    setPlayers(game.players.map(p => ({ name: p.name, id: Date.now() + Math.random() })))
    setCurrentGame(null)
  }

  const getScoreOptions = (category: Category): ScoreOption[] => {
    switch(category.key) {
      case 'nines':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 1 }))
      case 'tens':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 2 }))
      case 'jacks':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 3 }))
      case 'queens':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 4 }))
      case 'kings':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 5 }))
      case 'aces':
        return Array.from({length: 6}, (_, i) => ({ count: i, points: i * 6 }))
      case 'straight':
        return [
          { count: '0', points: 0 },
          { count: 'Normal', points: 20 },
          { count: 'Served', points: 25 }
        ]
      case 'full':
        return [
          { count: '0', points: 0 },
          { count: 'Normal', points: 30 },
          { count: 'Served', points: 35 }
        ]
      case 'poker':
        return [
          { count: '0', points: 0 },
          { count: 'Normal', points: 40 },
          { count: 'Served', points: 45 }
        ]
      case 'grande':
        return [
          { count: '0', points: 0 },
          { count: 'Normal', points: 50 },
          { count: 'Served', points: 80 }
        ]
      default:
        return []
    }
  }

  // Home Page
  if (currentPage === 'home') {
    return (
      <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`fixed top-6 right-6 p-3 rounded-full backdrop-blur-md border ${
              isDarkMode 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
            } transition-all duration-300`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Title */}
          <div className={`text-center mb-12 backdrop-blur-md rounded-2xl p-8 border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
          }`}>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Escalero
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Playing Book
            </p>
          </div>

          {/* New Game Button */}
          <button
            onClick={() => setCurrentPage('setup')}
            className={`mb-8 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-md border transition-all duration-300 transform hover:scale-110 hover:rotate-1 hover:shadow-2xl animate-pulse ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/30 text-white hover:from-blue-500/30 hover:to-purple-600/30' 
                : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/30 text-gray-800 hover:from-blue-500/30 hover:to-purple-600/30'
            }`}
            style={{ animationDuration: '3s' }}
          >
            <Play size={20} className="inline mr-2 animate-bounce" />
            New Game
          </button>

          {/* Game History */}
          <div className={`w-full max-w-md backdrop-blur-md rounded-xl p-6 border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Game History
            </h2>
            {gameHistory.length === 0 ? (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No games played yet
              </p>
            ) : (
              <div className="space-y-3">
                {gameHistory.slice(0, 8).map((game, index) => (
                  <button
                    key={game.id}
                    onClick={() => setHistoryDialog(game)}
                    className={`w-full p-3 rounded-lg border transform transition-all duration-500 hover:scale-105 hover:shadow-lg text-left ${
                      game.completed
                        ? isDarkMode ? 'bg-green-500/10 border-green-400/20 hover:bg-green-500/20' : 'bg-green-500/10 border-green-400/20 hover:bg-green-500/20'
                        : isDarkMode ? 'bg-yellow-500/10 border-yellow-400/20 hover:bg-yellow-500/20' : 'bg-yellow-500/10 border-yellow-400/20 hover:bg-yellow-500/20'
                    }`}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {game.completed ? '🏆' : '⏸️'}
                        </span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {game.completed 
                            ? (game.winner?.name || 'Unknown')
                            : `${game.players.length} players`
                          }
                        </span>
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {game.date}
                      </span>
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {game.completed ? (
                        `${game.players.length} players • ${getPlayerTotal(game.winner || game.players[0])} points`
                      ) : (
                        `In progress • ${getSortedPlayers(game)[0]?.name} leading`
                      )}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${
                      game.completed 
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {game.completed ? 'Completed' : 'Click to continue'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Dialog */}
        {historyDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={() => setHistoryDialog(null)}></div>
            
            <div className={`relative w-full max-w-lg backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${
              isDarkMode ? 'bg-black/60 border-white/20' : 'bg-white/60 border-black/20'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {historyDialog.completed ? '🏆 Game Results' : '⏸️ Game in Progress'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteGameFromHistory(historyDialog.id)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-500/20 text-red-600'
                    }`}
                    title="Delete game"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => setHistoryDialog(null)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  >
                    <X size={20} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
                  </button>
                </div>
              </div>
              
              {/* Game Info */}
              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {historyDialog.date} • {historyDialog.players.length} players
                </div>
                {!historyDialog.completed && (
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Progress: {historyDialog.players.reduce((total, player) => 
                      total + Object.values(player.scores).filter(score => score !== null).length, 0
                    )} / {historyDialog.players.length * categories.length} scores entered
                  </div>
                )}
              </div>
              
              {/* Players List */}
              <div className="space-y-3 mb-8">
                {getSortedPlayers(historyDialog).map((player, index) => (
                  <div key={player.id} className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-md border ${
                    historyDialog.completed && index === 0 
                      ? `bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/30 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`
                      : isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/10 border-black/20 text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`text-xl font-bold w-6 text-center ${
                        historyDialog.completed && index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-600') : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {index + 1}.
                      </div>
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${player.color}`}></div>
                      <div>
                        <div className={`font-bold ${historyDialog.completed && index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700') : ''}`}>
                          {player.name}
                          {historyDialog.completed && index === 0 && ' 👑'}
                        </div>
                        {historyDialog.completed && index === 0 && (
                          <div className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            Winner!
                          </div>
                        )}
                        {!historyDialog.completed && (
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {Object.values(player.scores).filter(score => score !== null).length}/{categories.length} scores
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      historyDialog.completed && index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700') : isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {getPlayerTotal(player)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              {historyDialog.completed ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      playAgainFromHistory(historyDialog)
                      setHistoryDialog(null)
                    }}
                    className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-blue-500/20 border-blue-400/30 text-blue-600 hover:bg-blue-500/30'
                    }`}
                  >
                    <Play size={20} className="inline mr-2" />
                    Play Again
                  </button>
                  <button
                    onClick={() => setHistoryDialog(null)}
                    className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-500/20 border-gray-400/30 text-gray-300 hover:bg-gray-500/30' 
                        : 'bg-gray-500/20 border-gray-400/30 text-gray-600 hover:bg-gray-500/30'
                    }`}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      continueGame(historyDialog)
                      setHistoryDialog(null)
                    }}
                    className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30' 
                        : 'bg-green-500/20 border-green-400/30 text-green-600 hover:bg-green-500/30'
                    }`}
                  >
                    <Play size={20} className="inline mr-2" />
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      const resetGame = {
                        ...historyDialog,
                        players: historyDialog.players.map(p => ({
                          ...p,
                          scores: categories.reduce((acc, cat) => ({ ...acc, [cat.key]: null }), {})
                        })),
                        completed: false,
                        winner: undefined
                      }
                      setCurrentGame(resetGame)
                      updateGameInHistory(resetGame)
                      setCurrentPage('game')
                      setHistoryDialog(null)
                    }}
                    className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-500/30' 
                        : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-600 hover:bg-yellow-500/30'
                    }`}
                  >
                    <RotateCcw size={20} className="inline mr-2" />
                    Restart
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Setup Page
  if (currentPage === 'setup') {
    return (
      <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="fixed inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className={`w-full max-w-md backdrop-blur-md rounded-2xl p-8 border ${
            isDarkMode ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Setup Game
            </h2>

            {/* Players */}
            <div className="space-y-4 mb-6">
              {players.map((player, index) => (
                <div key={player.id} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${playerColors[index]}`}></div>
                  <input
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg backdrop-blur-md border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20' 
                        : 'bg-black/10 border-black/20 text-gray-800 placeholder-gray-500 focus:bg-black/20'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                  <button
                    onClick={() => removePlayer(player.id)}
                    className={`p-2 rounded-lg backdrop-blur-md border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30' 
                        : 'bg-red-500/20 border-red-400/30 text-red-600 hover:bg-red-500/30'
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Player Button */}
            <button
              onClick={addPlayer}
              disabled={players.length >= 6}
              className={`w-full mb-6 px-4 py-3 rounded-xl font-semibold backdrop-blur-md border transition-all duration-300 ${
                players.length >= 6
                  ? isDarkMode ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed' : 'bg-gray-500/20 border-gray-400/30 text-gray-600 cursor-not-allowed'
                  : isDarkMode 
                    ? 'bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30 transform hover:scale-105' 
                    : 'bg-green-500/20 border-green-400/30 text-green-600 hover:bg-green-500/30 transform hover:scale-105'
              }`}
            >
              <Plus size={20} className="inline mr-2" />
              Add Player ({players.length}/6)
            </button>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold backdrop-blur-md border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-500/20 border-gray-400/30 text-gray-300 hover:bg-gray-500/30' 
                    : 'bg-gray-500/20 border-gray-400/30 text-gray-600 hover:bg-gray-500/30'
                }`}
              >
                Back
              </button>
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold backdrop-blur-md border transition-all duration-300 ${
                  players.length === 0
                    ? isDarkMode ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed' : 'bg-gray-500/20 border-gray-400/30 text-gray-600 cursor-not-allowed'
                    : isDarkMode 
                      ? 'bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transform hover:scale-105' 
                      : 'bg-blue-500/20 border-blue-400/30 text-blue-600 hover:bg-blue-500/30 transform hover:scale-105'
                }`}
              >
                <Play size={20} className="inline mr-2" />
                Play
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game Page
  if (currentPage === 'game' && currentGame) {
    return (
      <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Hamburger Menu */}
        <button
          onClick={() => setShowMenu(true)}
          className={`fixed top-4 left-4 z-50 p-3 rounded-full backdrop-blur-md border ${
            isDarkMode 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
              : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
          } transition-all duration-300`}
        >
          <Menu size={20} />
        </button>

        {/* Menu Overlay */}
        {showMenu && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1" onClick={() => setShowMenu(false)}></div>
            <div className={`w-64 h-full backdrop-blur-md border-l p-6 ${
              isDarkMode ? 'bg-black/40 border-white/20' : 'bg-white/40 border-black/20'
            }`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Menu</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                >
                  <X size={20} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    restartGame()
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-800'
                  }`}
                >
                  <RotateCcw size={20} />
                  <span>Restart Game</span>
                </button>
                
                <div className={`border-t ${isDarkMode ? 'border-white/20' : 'border-black/20'} pt-4`}>
                  <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manage Players
                  </p>
                  <button
                    onClick={() => {
                      addPlayerToGame()
                      setShowMenu(false)
                    }}
                    disabled={currentGame?.players.length >= 6}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 mb-2 ${
                      currentGame?.players.length >= 6
                        ? isDarkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                        : isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-800'
                    }`}
                  >
                    <Plus size={20} />
                    <span>Add Player ({currentGame?.players.length || 0}/6)</span>
                  </button>
                  
                  {currentGame?.players.map((player) => (
                    <div key={player.id} className={`flex items-center justify-between p-2 rounded-lg mb-1 ${
                      isDarkMode ? 'bg-white/5' : 'bg-black/5'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${player.color}`}></div>
                        <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {player.name}
                        </span>
                      </div>
                      {currentGame.players.length > 1 && (
                        <button
                          onClick={() => {
                            removePlayerFromGame(player.id)
                            setShowMenu(false)
                          }}
                          className={`p-1 rounded transition-all duration-300 ${
                            isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-500/20 text-red-600'
                          }`}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className={`border-t ${isDarkMode ? 'border-white/20' : 'border-black/20'} pt-4`}>
                  <button
                    onClick={() => {
                      playAgain()
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-800'
                    }`}
                  >
                    <Play size={20} />
                    <span>Play Again</span>
                  </button>
                  <button
                    onClick={() => {
                      finishGame()
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-800'
                    }`}
                  >
                    <Square size={20} />
                    <span>Finish Game</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('home')
                      setCurrentGame(null)
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-800'
                    }`}
                  >
                    <Home size={20} />
                    <span>Main Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Results Overlay */}
        {isGameComplete(currentGame) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/50">
              {/* Confetti Animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({length: 50}).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 opacity-80 animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)],
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      transform: `translateY(${Math.random() * 100}vh)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className={`relative w-full max-w-lg backdrop-blur-xl rounded-3xl p-8 border shadow-2xl transform animate-pulse ${
              isDarkMode ? 'bg-black/60 border-white/20' : 'bg-white/60 border-black/20'
            }`}>
              <h2 className={`text-3xl font-bold mb-8 text-center animate-bounce ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                🎉 Game Complete! 🎉
              </h2>
              
              {/* Results List */}
              <div className="space-y-4 mb-8">
                {getSortedPlayers(currentGame).map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-md border transform transition-all duration-500 hover:scale-105 ${
                      index === 0 
                        ? `bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/30 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} animate-pulse`
                        : isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/10 border-black/20 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold w-8 text-center ${
                        index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-600') : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {index + 1}.
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${player.color} ${index === 0 ? 'animate-spin' : ''}`}
                           style={{ animationDuration: index === 0 ? '3s' : 'none' }}></div>
                      <div>
                        <div className={`font-bold text-lg ${index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700') : ''}`}>
                          {player.name}
                          {index === 0 && <span className="animate-bounce inline-block ml-2">👑</span>}
                        </div>
                        {index === 0 && (
                          <div className={`text-sm animate-pulse ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            Winner!
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      index === 0 ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700') : isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <AnimatedCounter value={getPlayerTotal(player)} duration={1500} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => playAgain()}
                  className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                    isDarkMode 
                      ? 'bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-blue-500/20 border-blue-400/30 text-blue-600 hover:bg-blue-500/30'
                  }`}
                >
                  <Play size={20} className="inline mr-2 animate-bounce" />
                  Play Again
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('home')
                    setCurrentGame(null)
                  }}
                  className={`p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-110 hover:-rotate-1 ${
                    isDarkMode 
                      ? 'bg-gray-500/20 border-gray-400/30 text-gray-300 hover:bg-gray-500/30' 
                      : 'bg-gray-500/20 border-gray-400/30 text-gray-600 hover:bg-gray-500/30'
                  }`}
                >
                  <Home size={20} className="inline mr-2" />
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Table */}
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-fit">
            {/* Categories Column */}
            <div className="flex flex-col gap-3">
              {/* Empty header space */}
              <div className="h-24"></div>
              
              {/* Category labels */}
              {categories.map(category => (
                <div key={category.key} className={`flex items-center justify-center px-4 rounded-lg font-semibold backdrop-blur-md border w-[140px] h-[70px] text-lg ${
                  isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/10 border-black/20 text-gray-800'
                }`}>
                  {category.name}
                </div>
              ))}
            </div>

            {/* Player Columns */}
            {currentGame.players.map((player, playerIndex) => (
              <div key={player.id} className="flex flex-col gap-3">
                {/* Player Header with Total */}
                <div className={`text-center backdrop-blur-md rounded-lg p-3 border w-[140px] h-24 flex flex-col items-center justify-center ${
                  isDarkMode ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'
                }`}>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${player.color} mb-1`}></div>
                  <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {player.name}
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <AnimatedCounter value={getPlayerTotal(player)} />
                  </div>
                </div>

                {/* Score Cells */}
                {categories.map(category => (
                  <button
                    key={`${category.key}-${player.id}`}
                    onClick={() => openScoreDialog(category, playerIndex)}
                    className={`rounded-lg text-center font-semibold backdrop-blur-md border transition-all duration-300 w-[140px] h-[70px] flex items-center justify-center text-lg transform hover:scale-105 ${
                      scoreAnimation === `${category.key}-${playerIndex}` 
                        ? `animate-bounce scale-110 ${isDarkMode ? 'bg-blue-400/40 border-blue-300/50' : 'bg-blue-500/40 border-blue-600/50'}`
                        : ''
                    } ${
                      player.scores[category.key] !== null
                        ? 'bg-green-500/20 border-green-400/30 text-green-400 shadow-lg' 
                        : isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 animate-pulse' 
                          : 'bg-black/5 border-black/10 text-gray-800 hover:bg-black/10 hover:border-black/20 animate-pulse'
                    }`}
                    style={{
                      animationDuration: player.scores[category.key] === null ? '3s' : 'none'
                    }}
                  >
                    <span className={`transition-all duration-300 ${
                      scoreAnimation === `${category.key}-${playerIndex}` ? 'scale-125 font-bold' : ''
                    }`}>
                      {player.scores[category.key] !== null ? player.scores[category.key] : '\u00A0'}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Score Dialog */}
        {scoreDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Glassmorphism Background Overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30 animate-pulse" onClick={() => setScoreDialog(null)}></div>
            
            <div className={`relative w-full max-w-md backdrop-blur-xl rounded-3xl p-8 border shadow-2xl transform transition-all duration-500 scale-100 ${
              isDarkMode ? 'bg-black/40 border-white/20' : 'bg-white/40 border-black/20'
            }`}>
              <h3 className={`text-xl font-bold mb-8 text-center animate-pulse ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {['straight', 'full', 'poker', 'grande'].includes(scoreDialog.category.key)
                  ? `What type of ${scoreDialog.category.name} did ${currentGame.players[scoreDialog.playerIndex].name} roll?`
                  : `How many ${scoreDialog.category.name} did ${currentGame.players[scoreDialog.playerIndex].name} roll?`
                }
              </h3>
              
              {/* Score Options Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {getScoreOptions(scoreDialog.category).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setScore(option.points)}
                    className={`p-4 rounded-2xl font-bold backdrop-blur-md border transition-all duration-300 transform hover:scale-110 hover:rotate-2 hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30' 
                        : 'bg-black/10 border-black/20 text-gray-800 hover:bg-black/20 hover:border-black/30'
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1 animate-bounce" style={{ animationDuration: '2s' }}>
                      {option.count}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {option.points} points
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Cancel Button */}
              <button
                onClick={() => setScoreDialog(null)}
                className={`w-full p-4 rounded-2xl font-semibold backdrop-blur-md border transition-all duration-300 transform hover:scale-105 hover-shake ${
                  isDarkMode 
                    ? 'bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30 hover:border-red-400/40' 
                    : 'bg-red-500/20 border-red-400/30 text-red-600 hover:bg-red-500/30 hover:border-red-400/40'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
export interface Competition {
  id: string
  title: string
  subtitle?: string
  category: '英语' | '数学' | '编程' | 'AI' | '阅读'
  type: '每日挑战' | '周赛' | '月赛' | '全国活动'
  difficulty: '青铜' | '白银' | '黄金' | '大师'
  description?: string
  cover?: string
  organizer?: string
  startTime: string
  endTime: string
  rewardWEG: number
  participants?: number
  status: 'upcoming' | 'running' | 'ended'
  createdAt: string
}

const STORAGE_KEY = 'aiwego_competitions'

export function getCompetitions(): Competition[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function saveCompetition(comp: Competition): void {
  const list = getCompetitions()
  const idx = list.findIndex(c => c.id === comp.id)
  if (idx >= 0) list[idx] = comp
  else list.unshift(comp)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function deleteCompetition(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getCompetitions().filter(c => c.id !== id)))
}

export function getCompetitionById(id: string): Competition | undefined {
  return getCompetitions().find(c => c.id === id)
}

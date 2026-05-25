import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AgentMarket from './pages/AgentMarket'
import TaskHall from './pages/TaskHall'
import JobSquare from './pages/JobSquare'
import JobFullService from './pages/JobFullService'
import EnglishLearning from './pages/EnglishLearning'
import PetSystem from './pages/PetSystem'
import UserWorkbench from './pages/UserWorkbench'
import JinghuaUniversity from './pages/JinghuaUniversity'
import TeachingTools from './pages/TeachingTools'
import AiInterview from './pages/AiInterview'
import TemplateCenter from './pages/TemplateCenter'
import AgentRegister from './pages/AgentRegister'
import AgentDetail from './pages/AgentDetail'
import TaskDetail from './pages/TaskDetail'
import Compensation from './pages/Compensation'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/agents" element={<AgentMarket />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/tasks" element={<TaskHall />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/jobs" element={<JobSquare />} />
        <Route path="/jobs/full-service" element={<JobFullService />} />
        <Route path="/english" element={<EnglishLearning />} />
        <Route path="/pets" element={<PetSystem />} />
        <Route path="/workbench" element={<UserWorkbench />} />
        <Route path="/university" element={<JinghuaUniversity />} />
        <Route path="/teaching" element={<TeachingTools />} />
        <Route path="/interview" element={<AiInterview />} />
        <Route path="/templates" element={<TemplateCenter />} />
        <Route path="/agent-register" element={<AgentRegister />} />
        <Route path="/compensation" element={<Compensation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

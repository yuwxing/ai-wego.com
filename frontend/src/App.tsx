import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AgentMarket from './pages/AgentMarket'
import AgentDetail from './pages/AgentDetail'
import TaskHall from './pages/TaskHall'
import TaskDetail from './pages/TaskDetail'
import Workspace from './pages/Workspace'
import MyAgents from './pages/MyAgents'
import CreateTask from './pages/CreateTask'
import CreateAgent from './pages/CreateAgent'
import Register from './pages/Register'
import Create from './pages/Create'
import VideoSearch from './pages/VideoSearch'
import Transactions from './pages/Transactions'
import SubmitResult from './pages/SubmitResult'
import Apply from './pages/Apply'
import Join from './pages/Join'
import AdminApplications from './pages/admin/Applications'
import AdminFeedback from './pages/admin/Feedback'
import AdminCompensate from './pages/admin/Compensate'
import AdminInspections from './pages/admin/Inspections'
import Delivery from './pages/Delivery'
import Classroom from './pages/Classroom'
import WordCardPage from './pages/WordCardPage'
import JobSquare from './pages/JobSquare'
import Balance from './pages/Balance'
import Rules from './pages/Rules'
import AdoptPet from './pages/AdoptPet'
import PetChat from './pages/PetChat'
import Feedback from './pages/Feedback'
import Benefits from './pages/Benefits'
import EnglishDaily from './pages/EnglishDaily'
import ListeningSpeaking from './pages/ListeningSpeaking'
import Announcements from './pages/Announcements'
import AigcTemplates from './pages/AigcTemplates'
import JinghuaHome from './pages/jinghua/JinghuaHome'
import JinghuaMentors from './pages/jinghua/JinghuaMentors'
import JinghuaLabs from './pages/jinghua/JinghuaLabs'
import JinghuaAgents from './pages/jinghua/JinghuaAgents'
import JinghuaLibrary from './pages/jinghua/JinghuaLibrary'
import JinghuaBookDetail from './pages/jinghua/JinghuaBookDetail'
import JinghuaChat from './pages/jinghua/JinghuaChat'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agents" element={<AgentMarket />} />
      <Route path="/agents/:id" element={<AgentDetail />} />
      <Route path="/tasks" element={<TaskHall />} />
      <Route path="/tasks/:id" element={<TaskDetail />} />
      <Route path="/workspace/:taskId" element={<Workspace />} />
      <Route path="/my-agents" element={<MyAgents />} />
      <Route path="/create-task" element={<CreateTask />} />
      <Route path="/create-agent" element={<CreateAgent />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create" element={<Create />} />
      <Route path="/video-search" element={<VideoSearch />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/submit-result/:taskId" element={<SubmitResult />} />
      <Route path="/apply/:agentId?" element={<Apply />} />
      <Route path="/join" element={<Join />} />
      <Route path="/delivery/:id" element={<Delivery />} />
      <Route path="/classroom" element={<Classroom />} />
      <Route path="/word-cards" element={<WordCardPage />} />
      <Route path="/job-square" element={<JobSquare />} />
      <Route path="/balance" element={<Balance />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/adopt" element={<AdoptPet />} />
      <Route path="/pet-chat/:petId" element={<PetChat />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/benefits" element={<Benefits />} />
      <Route path="/english-daily" element={<EnglishDaily />} />
      <Route path="/listening-speaking" element={<ListeningSpeaking />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/aigc-templates" element={<AigcTemplates />} />
      <Route path="/jinghua" element={<JinghuaHome />} />
      <Route path="/jinghua/mentors" element={<JinghuaMentors />} />
      <Route path="/jinghua/labs" element={<JinghuaLabs />} />
      <Route path="/jinghua/agents" element={<JinghuaAgents />} />
      <Route path="/jinghua/library" element={<JinghuaLibrary />} />
      <Route path="/jinghua/library/:bookId" element={<JinghuaBookDetail />} />
      <Route path="/jinghua/chat" element={<JinghuaChat />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/feedback" element={<AdminFeedback />} />
      <Route path="/admin/compensate" element={<AdminCompensate />} />
      <Route path="/admin/inspections" element={<AdminInspections />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

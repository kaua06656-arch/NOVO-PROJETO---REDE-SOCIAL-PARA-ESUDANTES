import { redirect } from 'next/navigation'

export default function ChatIndexPage() {
    // Redirect to matches - user should select a chat from there
    redirect('/network')
}

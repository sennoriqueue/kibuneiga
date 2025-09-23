import MoodPicker from '@/components/MoodPicker'

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">気分に合わせて映画を見つけよう</h2>
      <p className="text-sm text-zinc-400">
        気分とシチュエーションを選ぶと、あなたにぴったりの映画を提案します。
      </p>
      <MoodPicker />
    </div>
  )
}

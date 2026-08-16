import {
  Download,
  ExternalLink,
  FileUp,
  Link,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './App.css'

type SectionKey =
  | 'current'
  | 'assets'
  | 'sources'
  | 'seeds'
  | 'experiments'
  | 'learnings'

type CommandItem = {
  id: string
  section: SectionKey
  title: string
  body: string
  tags: string[]
  links: string[]
  status?: string
  startDate?: string
  reviewCue?: string
  updatedAt: string
}

type AppData = {
  version: 1
  settings: {
    dashboardUrl: string
  }
  items: CommandItem[]
}

type Draft = {
  section: SectionKey
  title: string
  body: string
  tags: string
  links: string
  status: string
  startDate: string
  reviewCue: string
}

const storageKey = 'jiritsu-command-center-v1'
const now = new Date().toISOString()

const sections: Array<{
  key: SectionKey
  title: string
  note: string
  placeholder: string
}> = [
  {
    key: 'current',
    title: '今の現在地',
    note: '今の状態、育っているもの、気になること、今はやらないことを自由に置く場所。',
    placeholder: '例: 今の状態、今育っているもの、今気になっていること、今はやらないこと',
  },
  {
    key: 'assets',
    title: '持っているもの',
    note: '教材、記録、自作アプリ、発信場所、商品候補などの地図。',
    placeholder: '例: 過去の記録、使える教材、自作アプリ、アイデアの保管場所',
  },
  {
    key: 'sources',
    title: '情報源・相談先',
    note: '困ったとき、迷ったときに見に行く場所や相談できる人。',
    placeholder: '例: 相談できる人、よく見る教材、過去ログ、参考リンク',
  },
  {
    key: 'seeds',
    title: '気になる種',
    note: 'まだタスクにしない、試してみたいことや違和感。',
    placeholder: '例: いつか試したい発信テーマ、商品になりそうな問い',
  },
  {
    key: 'experiments',
    title: '実験中',
    note: '同時に増やしすぎず、いま観察している少数の実験。',
    placeholder: '例: 何を試すか、どんな変化を見るか、焦らないための前提',
  },
  {
    key: 'learnings',
    title: '分かったこと・次につなげること',
    note: '実験から分かったこと、続けること、やめること、既存ダッシュボードへ渡す候補。',
    placeholder: '例: 分かったこと、次に試すこと、今日の管理へ渡すこと',
  },
]

const initialData: AppData = {
  version: 1,
  settings: {
    dashboardUrl: '',
  },
  items: [
    {
      id: 'current-state-1',
      section: 'current',
      title: '自立に向けた現在地',
      body:
        '将来的に、自分の収入で生活できる状態を目指している。\n\n今すぐ収益を急ぐ必要はなく、小さく試せる時間がある。\n\n発信、教材、人とのつながり、自作アプリなど、すでに材料はかなりある。\n\n今は「何もない」段階ではなく、持っているものを整理して試す段階。\n\n全部を一気にやらず、余白も残す。',
      tags: ['現在地', '自立', '余白'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-note',
      section: 'assets',
      title: 'note',
      body: '通常記事。\nSubstack初心者向け記事。',
      tags: ['発信場所', '記事'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-substack',
      section: 'assets',
      title: 'Substack',
      body:
        '通常パブリケーション。\n虐待・過去を扱うパブリケーション。\nSubstack初心者向けパブリケーション。\n音声記事。\n購読者チャット。\nPodcast。\nライブ配信。\nNotes。',
      tags: ['発信場所', '音声', 'コミュニケーション'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-wordpress',
      section: 'assets',
      title: 'WordPress',
      body:
        'まだ育てている途中。\n\n現在の主な箱:\n・暮らしの道具箱: 自作アプリなどを置く予定\n・小さな実験: AIに投げたものがどう返ってきたか等の実験記録\n・概念辞典: 「仮説と検証」などの概念を置く',
      tags: ['サイト', '育成中', '実験記録'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-apps',
      section: 'assets',
      title: '自作アプリ',
      body: '約25個。\n買い物、診察、PMDDなど、生活の困りごとから作ったものがある。',
      tags: ['自作アプリ', '生活支援'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-obsidian',
      section: 'assets',
      title: 'Obsidian',
      body:
        '過去に書いたブログのほぼすべてと、大量の記録がある。\n\n本人が全部把握するためではなく、必要なときAIが探し出す資料庫として使う。',
      tags: ['資料庫', '過去記録', 'AI'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-brain',
      section: 'assets',
      title: 'Brain',
      body: 'マーケティング、スキル、アフィリエイト、その他、購入済みのものあり。',
      tags: ['教材', 'マーケティング'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'asset-books',
      section: 'assets',
      title: '書籍・Kindle',
      body: '多数あり。\n必要なテーマが出たときに参照する。',
      tags: ['書籍', '参照'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'source-substamura',
      section: 'sources',
      title: 'サブスタ村コミュニティ',
      body:
        '役割: 必要なときに答えを探しに行く資料庫。\n\n中にあるもの:\n・実践書ライブラリー。公開済みPDFは既存ダッシュボードにも取り込み済み。今後追加される可能性あり。「今の悩みから探す」でテーマ別に探せる。\n・基本講座。現在53回まで。1本約2〜10分。商品づくり、欲しいものの聞き方、事前質問、事後質問、価格設定、企画名、コンセプトなどあり。\n・よしなりさん作成の手順書。\n\n使い方:\n必要になったときに探す。\n必要なPDF・動画・手順書だけ見る。\n1つだけ試す。\n結果を司令塔へ戻す。',
      tags: ['資料庫', 'Substack', '実践書'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'source-viana',
      section: 'sources',
      title: 'ヴィアナさん',
      body:
        '役割: 自分では気づいていない強みや企画の可能性を外から見つけてくれる人。\n\n主な提案:\n・商業出版\n・Kindle\n・Substack×コミュニケーション\n・講座／テキスト教材\n・アプリ実演\n・モニターから有料化\n・コミュニティづくり\n\n詳細は別途Googleドキュメントに整理済み。',
      tags: ['相談先', '企画', '強み'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'source-yoshida',
      section: 'sources',
      title: 'よしだ健康さんのメンバーシップ',
      body:
        'note: ほぼ毎日1記事追加。\nSubstack: ほぼ毎日更新。\nPodcast: ほぼ毎日更新。ただし一定期間後に見られなくなる可能性あり。\nX: あり。かなり長文の投稿もある。\nnoteの匿名質問ボックスで質問可能。\n\n役割: 現在進行形の実践を見る場所＋匿名で相談できる場所。\n全部追わず、必要なテーマがあるときに使う。',
      tags: ['実践観察', '相談先', 'メンバーシップ'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'source-masahiro',
      section: 'sources',
      title: 'まさひろさんのメンバーシップ',
      body:
        'note: 不定期で追加。\n月1回セミナー。\n運営会議のような場あり。\n今後書いてほしいnoteやセミナー内容を提案可能。\n内容は比較的初心者向け。\nSubstack DMで自由に質問可能。\n上位プランでは月30分Zoom相談あり。\n\n役割: 気軽に具体的なことを質問できる相談先。\n特にKindle出版直後なので、実体験を聞く先として使える。',
      tags: ['相談先', 'Kindle', '初心者向け'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-app-demo',
      section: 'seeds',
      title: 'みんなの困りごとからアプリを作る実演',
      body: '困りごとを聞き、言葉にして、AIと一緒に小さなアプリへ形にする過程を見せる。',
      tags: ['アプリ実演', 'AI', '困りごと'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-app-monitor',
      section: 'seeds',
      title: 'アプリの無料モニター',
      body: 'まず無料で使ってもらい、どこに価値や引っかかりがあるかを見る。',
      tags: ['モニター', '自作アプリ'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-app-paid',
      section: 'seeds',
      title: 'アプリの有料化',
      body: '無料モニターや実演の反応を見てから、小さく有料化の形を考える。',
      tags: ['有料化', '自作アプリ'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-substack-kindle',
      section: 'seeds',
      title: 'Substack×コミュニケーションのKindle',
      body: 'Substackを単なる配信場所ではなく、読者との関係づくりとして扱うKindle案。',
      tags: ['Substack', 'Kindle'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-commercial-book',
      section: 'seeds',
      title: '過去と現在の変化を扱う商業出版',
      body: '過去の経験と、現在の変化・回復・実践を扱う出版案。',
      tags: ['商業出版', '過去と現在'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-course',
      section: 'seeds',
      title: 'テキスト教材・講座',
      body: 'いきなり大きく作らず、小さなテキストや短い講座として試す。',
      tags: ['教材', '講座'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-place',
      section: 'seeds',
      title: '同じ経験をした人が集まれる場',
      body: '似た経験を持つ人が安心して集まれる場の可能性。',
      tags: ['場づくり', 'コミュニティ'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-substack-support',
      section: 'seeds',
      title: 'Substack初心者支援の発展',
      body: 'すでにある初心者向け記事やパブリケーションを、支援や教材へ広げる可能性。',
      tags: ['Substack', '初心者支援'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'seed-community',
      section: 'seeds',
      title: 'コミュニティづくり',
      body: '発信、相談、実験、支援がゆるくつながる場の可能性。',
      tags: ['コミュニティ', '長期案'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'experiment-app-demo',
      section: 'experiments',
      title: 'みんなの困りごとからアプリを作る実演',
      body:
        '仮説:\nプログラミングそのものではなく、困りごとを言葉にしてAIと一緒に形にする過程に価値があるのではないか。',
      tags: ['準備中', 'アプリ実演', 'AI'],
      links: [],
      status: '準備中',
      startDate: '',
      reviewCue: '一度、事前に自分で実演用アプリを作り、実演の流れを整理できたら。',
      updatedAt: now,
    },
    {
      id: 'learning-1',
      section: 'learnings',
      title: '当たり前に見えることの価値',
      body: '自分にとって当たり前のことが、他の人には価値として見えることがある。',
      tags: ['価値', '強み'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'learning-2',
      section: 'learnings',
      title: 'すでにあるものを組み合わせる',
      body: '全部を新しく作る必要はなく、すでにある発信場所や教材を組み合わせられる。',
      tags: ['組み合わせ', '資産活用'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'learning-3',
      section: 'learnings',
      title: '必要なときに今ある情報を使う',
      body: '新しい情報を集めるより、必要なときに今ある情報を使うことが大事。',
      tags: ['情報源', '選択'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'learning-4',
      section: 'learnings',
      title: '商品は小さく試してから考える',
      body: '商品は最初から決めず、小さく試して反応を見る。',
      tags: ['実験', '商品化'],
      links: [],
      updatedAt: now,
    },
    {
      id: 'learning-5',
      section: 'learnings',
      title: '司令塔と既存ダッシュボードの役割',
      body: '司令塔で方向を見て、今日やることは既存ダッシュボードへ渡す。',
      tags: ['運用', '既存ダッシュボード'],
      links: [],
      updatedAt: now,
    },
  ],
}

const emptyDraft: Draft = {
  section: 'current',
  title: '',
  body: '',
  tags: '',
  links: '',
  status: '',
  startDate: '',
  reviewCue: '',
}

function createId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function parseLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function formatDate(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false
  const data = value as AppData
  return data.version === 1 && Array.isArray(data.items) && Boolean(data.settings)
}

function itemSearchText(item: CommandItem) {
  return [
    item.title,
    item.body,
    item.tags.join(' '),
    item.links.join(' '),
    item.status,
    item.startDate,
    item.reviewCue,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return initialData

    try {
      const parsed = JSON.parse(saved)
      return isAppData(parsed) ? parsed : initialData
    } catch {
      return initialData
    }
  })
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('端末内に自動保存されます')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data])

  const counts = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      count: data.items.filter((item) => item.section === section.key).length,
    }))
  }, [data.items])

  const currentSection = sections.find((section) => section.key === draft.section)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedSearchQuery.length > 0
  const searchResults = useMemo(() => {
    if (!normalizedSearchQuery) return []
    return data.items.filter((item) => itemSearchText(item).includes(normalizedSearchQuery))
  }, [data.items, normalizedSearchQuery])

  function resetForm(section: SectionKey = draft.section) {
    setDraft({ ...emptyDraft, section })
    setEditingId(null)
  }

  function updateDraft(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.title.trim()) {
      setMessage('タイトルを入力してください')
      return
    }

    const nextItem: CommandItem = {
      id: editingId ?? createId(),
      section: draft.section,
      title: draft.title.trim(),
      body: draft.body.trim(),
      tags: parseTags(draft.tags),
      links: parseLines(draft.links),
      status: draft.section === 'experiments' ? draft.status.trim() : undefined,
      startDate: draft.section === 'experiments' ? draft.startDate : undefined,
      reviewCue: draft.section === 'experiments' ? draft.reviewCue.trim() : undefined,
      updatedAt: new Date().toISOString(),
    }

    setData((current) => ({
      ...current,
      items: editingId
        ? current.items.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...current.items],
    }))
    setMessage(editingId ? '編集を保存しました' : '項目を追加しました')
    resetForm(draft.section)
  }

  function editItem(item: CommandItem) {
    setEditingId(item.id)
    setDraft({
      section: item.section,
      title: item.title,
      body: item.body,
      tags: item.tags.join(', '),
      links: item.links.join('\n'),
      status: item.status ?? '',
      startDate: item.startDate ?? '',
      reviewCue: item.reviewCue ?? '',
    })
    setMessage('編集中です')
  }

  function deleteItem(id: string) {
    setData((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }))
    if (editingId === id) resetForm()
    setMessage('削除しました')
  }

  function restoreInitialData() {
    setData(initialData)
    resetForm('current')
    setMessage('初期データに戻しました')
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `jiritsu-command-center-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('JSONを書き出しました')
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!isAppData(parsed)) {
          setMessage('読み込める形式ではありません')
          return
        }
        setData(parsed)
        resetForm(parsed.items[0]?.section ?? 'current')
        setMessage('JSONを読み込みました')
      } catch {
        setMessage('JSONの読み込みに失敗しました')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  function updateDashboardUrl(value: string) {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        dashboardUrl: value,
      },
    }))
  }

  function getSectionTitle(sectionKey: SectionKey) {
    return sections.find((section) => section.key === sectionKey)?.title ?? ''
  }

  function renderItemCard(item: CommandItem, showSection = false) {
    return (
      <div className="item-card" key={item.id}>
        {showSection && <p className="section-badge">{getSectionTitle(item.section)}</p>}
        <div className="item-heading">
          <h3>{item.title}</h3>
          <div className="item-actions">
            <button type="button" className="icon-button" onClick={() => editItem(item)} aria-label={`${item.title}を編集`}>
              <Pencil size={16} />
            </button>
            <button type="button" className="icon-button danger" onClick={() => deleteItem(item.id)} aria-label={`${item.title}を削除`}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {item.body && <p className="item-body">{item.body}</p>}
        {item.section === 'experiments' && (item.status || item.startDate || item.reviewCue) && (
          <div className="experiment-meta">
            {item.status && <span>状態: {item.status}</span>}
            {item.startDate && <span>開始: {formatDate(item.startDate)}</span>}
            {item.reviewCue && <span>見直し: {item.reviewCue}</span>}
          </div>
        )}
        {item.tags.length > 0 && (
          <div className="tag-row">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        {item.links.length > 0 && (
          <div className="link-list">
            {item.links.map((itemLink) => (
              <a key={itemLink} href={itemLink} target="_blank">
                <Link size={14} />
                {itemLink}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">自立に向けた実験の司令塔</p>
          <h1>散らばった可能性を、見に行ける地図にする</h1>
          <p className="lead">
            毎日のタスク表ではなく、現在地、持っているもの、試したいこと、分かったことを一か所で確認するための画面です。
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="ghost-button" onClick={restoreInitialData}>
            <RefreshCw size={18} />
            初期データに戻す
          </button>
          <button type="button" className="ghost-button" onClick={exportJson}>
            <Download size={18} />
            JSONを書き出す
          </button>
          <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()}>
            <FileUp size={18} />
            JSONを読み込む
          </button>
          <input ref={fileInputRef} className="hidden-input" type="file" accept="application/json" onChange={importJson} />
        </div>
      </header>

      <section className="search-panel" aria-label="横断検索">
        <div className="search-box">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="6つの領域から探す。例: Kindle、アプリ、相談"
          />
          {searchQuery && (
            <button type="button" className="icon-button" onClick={() => setSearchQuery('')} aria-label="検索文字を消す">
              <X size={16} />
            </button>
          )}
        </div>
        <p>
          {isSearching
            ? `「${searchQuery}」に一致したカード: ${searchResults.length}件`
            : 'タイトル、メモ、タグ、関連リンク、実験の状態や見直し目安を横断して探せます。'}
        </p>
      </section>

      <section className="overview" aria-label="6つの領域">
        {counts.map((section) => (
          <button
            type="button"
            className="overview-card"
            key={section.key}
            onClick={() => resetForm(section.key)}
          >
            <span>{section.title}</span>
            <strong>{section.count}</strong>
          </button>
        ))}
      </section>

      <div className="workspace">
        <aside className="side-panel">
          <form className="editor" onSubmit={handleSubmit}>
            <div className="panel-title">
              <div>
                <p className="eyebrow">{editingId ? '編集' : '追加'}</p>
                <h2>{editingId ? '項目を整える' : '新しく置く'}</h2>
              </div>
              {editingId && (
                <button type="button" className="icon-button" onClick={() => resetForm()}>
                  <X size={18} />
                </button>
              )}
            </div>

            <label>
              領域
              <select value={draft.section} onChange={(event) => updateDraft('section', event.target.value as SectionKey)}>
                {sections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              タイトル
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="短い名前" />
            </label>

            <label>
              メモ
              <textarea
                value={draft.body}
                onChange={(event) => updateDraft('body', event.target.value)}
                placeholder={currentSection?.placeholder}
                rows={7}
              />
            </label>

            {draft.section === 'experiments' && (
              <div className="experiment-fields">
                <label>
                  状態
                  <input value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} placeholder="例: 準備中" />
                </label>
                <label>
                  開始日
                  <input type="date" value={draft.startDate} onChange={(event) => updateDraft('startDate', event.target.value)} />
                </label>
                <label>
                  次に見直す目安
                  <input
                    value={draft.reviewCue}
                    onChange={(event) => updateDraft('reviewCue', event.target.value)}
                    placeholder="例: 記事を5本出したら / 一度実演したら"
                  />
                </label>
              </div>
            )}

            <label>
              タグ
              <input value={draft.tags} onChange={(event) => updateDraft('tags', event.target.value)} placeholder="カンマ区切り" />
            </label>

            <label>
              関連リンク
              <textarea
                value={draft.links}
                onChange={(event) => updateDraft('links', event.target.value)}
                placeholder="1行に1つずつ"
                rows={4}
              />
            </label>

            <button className="primary-button" type="submit">
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? '保存する' : '追加する'}
            </button>
            <p className="status-text">{message}</p>
          </form>

          <section className="settings-panel">
            <div className="panel-title compact">
              <Settings size={18} />
              <h2>既存ダッシュボード</h2>
            </div>
            <label>
              リンク先
              <input
                value={data.settings.dashboardUrl}
                onChange={(event) => updateDashboardUrl(event.target.value)}
                placeholder="https://... または ./index.html"
              />
            </label>
            {data.settings.dashboardUrl ? (
              <a className="dashboard-link" href={data.settings.dashboardUrl} target="_blank">
                今日やることは既存ダッシュボードで管理する
                <ExternalLink size={16} />
              </a>
            ) : (
              <p className="muted">リンクを設定すると、今日やることの管理画面へ移動できます。</p>
            )}
          </section>
        </aside>

        <section className="section-grid">
          {isSearching && (
            <article className="area search-results-area">
              <div className="area-heading">
                <div>
                  <h2>検索結果</h2>
                  <p>6つの領域を横断して、一致したカードだけを表示しています。</p>
                </div>
              </div>
              <div className="card-list">
                {searchResults.length === 0 && <p className="empty">一致するカードはありません。</p>}
                {searchResults.map((item) => renderItemCard(item, true))}
              </div>
            </article>
          )}
          {!isSearching && sections.map((section) => {
            const items = data.items.filter((item) => item.section === section.key)
            return (
              <article className="area" key={section.key}>
                <div className="area-heading">
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.note}</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => resetForm(section.key)}>
                    <Plus size={18} />
                  </button>
                </div>

                <div className="card-list">
                  {items.length === 0 && <p className="empty">ここにまだ項目はありません。</p>}
                  {items.map((item) => (
                    <div className="item-card" key={item.id}>
                      <div className="item-heading">
                        <h3>{item.title}</h3>
                        <div className="item-actions">
                          <button type="button" className="icon-button" onClick={() => editItem(item)} aria-label={`${item.title}を編集`}>
                            <Pencil size={16} />
                          </button>
                          <button type="button" className="icon-button danger" onClick={() => deleteItem(item.id)} aria-label={`${item.title}を削除`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {item.body && <p className="item-body">{item.body}</p>}
                      {item.section === 'experiments' && (item.status || item.startDate || item.reviewCue) && (
                        <div className="experiment-meta">
                          {item.status && <span>状態: {item.status}</span>}
                          {item.startDate && <span>開始: {formatDate(item.startDate)}</span>}
                          {item.reviewCue && <span>見直し: {item.reviewCue}</span>}
                        </div>
                      )}
                      {item.tags.length > 0 && (
                        <div className="tag-row">
                          {item.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {item.links.length > 0 && (
                        <div className="link-list">
                          {item.links.map((itemLink) => (
                            <a key={itemLink} href={itemLink} target="_blank">
                              <Link size={14} />
                              {itemLink}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}

export default App

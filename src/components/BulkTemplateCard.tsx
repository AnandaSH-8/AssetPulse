import { useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { financialAPI } from '@/services/api'

export const TEMPLATE_HEADERS = ['Title', 'Category', 'Cash', 'Invested', 'Current'] as const

type ParsedRow = {
  title: string
  category: string
  cash: number
  invested: number
  current: number
  error?: string
}

interface Props {
  savedTitles: string[]
  categories: string[]
  cashOnlyCategories: Set<string>
  month: string
  year: string
  monthNumber: number
  isReadOnly: boolean
  onImported: () => void
}

export default function BulkTemplateCard({
  savedTitles,
  categories,
  cashOnlyCategories,
  month,
  year,
  monthNumber,
  isReadOnly,
  onImported,
}: Props) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const validRows = rows.filter(r => !r.error)

  const handleDownload = () => {
    const body =
      savedTitles.length > 0
        ? savedTitles.map(t => [t, '', '', '', ''])
        : [['', '', '', '', '']]
    const ws = XLSX.utils.aoa_to_sheet([[...TEMPLATE_HEADERS], ...body])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Particulars')
    XLSX.writeFile(wb, `AssetsManager_Template_${month}_${year}.csv`, { bookType: 'csv' })
    toast({
      title: 'Template downloaded',
      description:
        savedTitles.length > 0
          ? `${savedTitles.length} existing titles included. Fill in Category and amounts.`
          : 'Fill in Title, Category and amounts, then upload it back.',
    })
  }

  const parseNumber = (v: unknown) => {
    if (v === undefined || v === null || String(v).trim() === '') return 0
    const n = Number(String(v).replace(/[,₹\s]/g, ''))
    return Number.isFinite(n) ? n : NaN
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const matrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
        if (!matrix.length) {
          toast({ title: 'Empty file', description: 'The uploaded file has no rows.', variant: 'destructive' })
          return
        }

        // ── Header validation ────────────────────────────────────────────
        const headers = (matrix[0] || []).map(h => String(h ?? '').trim())
        const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
        const expected = TEMPLATE_HEADERS.map(norm)
        const found = headers.filter(h => h !== '').map(norm)
        const missing = TEMPLATE_HEADERS.filter(h => !found.includes(norm(h)))
        const extra = headers.filter(h => h !== '' && !expected.includes(norm(h)))
        if (missing.length || extra.length) {
          toast({
            title: 'Invalid template headers',
            description: [
              missing.length ? `Missing: ${missing.join(', ')}` : '',
              extra.length ? `Unexpected: ${extra.join(', ')}` : '',
              'Please download the template again and do not rename the headers.',
            ]
              .filter(Boolean)
              .join(' — '),
            variant: 'destructive',
          })
          return
        }

        const idx = (name: string) => headers.findIndex(h => norm(h) === norm(name))
        const iTitle = idx('Title')
        const iCat = idx('Category')
        const iCash = idx('Cash')
        const iInv = idx('Invested')
        const iCur = idx('Current')

        const parsed: ParsedRow[] = []
        for (const raw of matrix.slice(1)) {
          const title = String(raw?.[iTitle] ?? '').trim()
          const category = String(raw?.[iCat] ?? '').trim()
          const cash = parseNumber(raw?.[iCash])
          const invested = parseNumber(raw?.[iInv])
          const current = parseNumber(raw?.[iCur])

          // Skip fully blank rows (e.g. pre-filled titles left untouched)
          if (!title && !category && !cash && !invested && !current) continue

          let error: string | undefined
          if (!title) error = 'Title is required'
          else if (!category) error = 'Category is required'
          else if (!categories.some(c => norm(c) === norm(category)))
            error = `Unknown category "${category}"`
          else if ([cash, invested, current].some(n => Number.isNaN(n)))
            error = 'Amounts must be numbers'
          else if ([cash, invested, current].some(n => n < 0))
            error = 'Amounts cannot be negative'
          else if (!cash && !invested && !current) error = 'Enter at least one amount'

          const matchedCategory = categories.find(c => norm(c) === norm(category)) || category
          parsed.push({
            title,
            category: matchedCategory,
            cash: Number.isNaN(cash) ? 0 : cash,
            invested: Number.isNaN(invested) ? 0 : invested,
            current: Number.isNaN(current) ? 0 : current,
            error,
          })
        }

        if (!parsed.length) {
          toast({
            title: 'Nothing to import',
            description: 'The template has headers but no filled-in rows.',
            variant: 'destructive',
          })
          return
        }
        setRows(parsed)
        setOpen(true)
      } catch {
        toast({
          title: 'Could not read file',
          description: 'Please upload the downloaded CSV template.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    setIsImporting(true)
    let success = 0
    let failed = 0
    for (const row of validRows) {
      try {
        const isCashOnly = cashOnlyCategories.has(row.category)
        const cash = isCashOnly ? row.cash || row.current : 0
        const invested = isCashOnly ? 0 : row.invested
        const current = isCashOnly ? cash : row.current || row.invested
        await financialAPI.create({
          category: row.category,
          description: row.title,
          amount: cash + invested,
          cash,
          investment: invested,
          current_value: current,
          month,
          month_number: monthNumber,
          year: Number(year),
        })
        success++
      } catch {
        failed++
      }
    }
    setIsImporting(false)
    setOpen(false)
    setRows([])
    toast({
      title: 'Import complete',
      description: `${success} entr${success === 1 ? 'y' : 'ies'} added for ${month} ${year}${
        failed ? `, ${failed} failed` : ''
      }.`,
      variant: failed ? 'destructive' : 'default',
    })
    if (success) onImported()
  }

  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Bulk entry via template</h3>
            <p className="text-xs text-muted-foreground">
              Add many assets at once for {month} {year}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Columns: <span className="font-medium">Title, Category, Cash, Invested, Current</span>.
          Do not rename or reorder the header row — it is validated on upload.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            type="button"
            className="flex-1 h-11 rounded-xl bg-gradient-primary"
            disabled={isReadOnly}
            title={isReadOnly ? 'Disabled for the demo account' : 'Upload the filled template'}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </GlassCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review template rows</DialogTitle>
            <DialogDescription>
              {validRows.length} of {rows.length} rows are valid and will be saved to{' '}
              {month} {year}. Rows with errors are skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-right p-2 font-medium">Cash</th>
                  <th className="text-right p-2 font-medium">Invested</th>
                  <th className="text-right p-2 font-medium">Current</th>
                  <th className="text-left p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${r.error ? 'bg-destructive/5' : ''}`}
                  >
                    <td className="p-2">{r.title || '—'}</td>
                    <td className="p-2">{r.category || '—'}</td>
                    <td className="p-2 text-right">{r.cash}</td>
                    <td className="p-2 text-right">{r.invested}</td>
                    <td className="p-2 text-right">{r.current}</td>
                    <td className="p-2">
                      {r.error ? (
                        <span className="inline-flex items-center gap-1 text-destructive text-xs">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {r.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-success text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary"
              onClick={handleImport}
              disabled={isImporting || validRows.length === 0}
            >
              {isImporting ? 'Importing...' : `Import ${validRows.length} row(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

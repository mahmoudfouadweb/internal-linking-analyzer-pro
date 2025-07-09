/**
 * @author Mahmoud & Gemini
 * @description The main UI component for the Keyword Extractor feature.
 * @created 2025-07-07
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-08
 */
'use client'; // This directive indicates that this is a Client Component in Next.js

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react'; // Import ChangeEvent

// Import the custom hook and shared interfaces
import { useKeywordExtraction, ExtractionSettings, SitemapInfo, KeywordExtractionRow, ParsedPageData } from '@internal-linking-analyzer-pro/types/sitemap'; // Fixed: Import from shared types

// shadcn/ui components (assuming they are set up in your project)
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Lucide React Icons
import { Loader2, Settings, X, Search, Link as LinkIcon, ExternalLink, Trash2, Copy } from 'lucide-react';

export default function KeywordExtractor() {
  const {
    rows,
    selectedRows,
    urlsText,
    keywordsText,
    sitemaps,
    isLoading,
    error,
    progress,
    settings,
    filterText,
    sortConfig,
    setUrlsText,
    setKeywordsText,
    setSettings,
    setFilterText,
    requestSort,
    handleExtract,
    handleSelect,
    handleCopySelected,
    copyToClipboard,
    resetExtraction,
    handleExtractFromSitemap,
    handleSelectAll,
    clearTable,
    handleRemoveSelectedRows,
    handleRemoveUnselectedRows,
    filteredAndSortedRows, // Use the memoized function from the hook
  } = useKeywordExtraction();

  const [sitemapUrlInput, setSitemapUrlInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isRemoveSelectedConfirmOpen, setIsRemoveSelectedConfirmOpen] = useState(false);
  const [isRemoveUnselectedConfirmOpen, setIsRemoveUnselectedConfirmOpen] = useState(false);

  // Use useMemo to get the filtered and sorted rows for display
  const displayedRows = useMemo(() => filteredAndSortedRows(), [filteredAndSortedRows]);

  // Handle URL extraction from text area
  const handleUrlExtractClick = useCallback(() => {
    const urls = urlsText.split('\n').map(url => url.trim()).filter(Boolean);
    if (urls.length > 0) {
      // For manual input, we only have the URL string, so create ParsedPageData objects
      // The keyword will be extracted by the hook's internal logic
      const parsedLinks: ParsedPageData[] = urls.map(url => ({ url, keyword: '' }));
      handleExtract(parsedLinks, true); // Pass true to reset existing rows
    } else {
      // Use the hook's setError for consistency
      // Note: The `error` state in useKeywordExtraction is used for both success and error messages
      // A more robust solution might use a dedicated `toast` notification system.
      (setError as (msg: string | null) => void)('الرجاء إدخال روابط في صندوق "الروابط فقط".'); // Cast setError to handle string | null
    }
  }, [urlsText, handleExtract, setError]);

  // Handle Sitemap extraction
  const handleSitemapExtractClick = useCallback(() => {
    handleExtractFromSitemap(sitemapUrlInput);
  }, [sitemapUrlInput, handleExtractFromSitemap]);

  // Handle setting changes
  const handleSettingChange = useCallback((key: keyof ExtractionSettings, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  }, [setSettings]);

  // Effect to manage error dialog
  useEffect(() => {
    if (error && error !== 'تم نسخ النص إلى الحافظة بنجاح.') { // Only show dialog for actual errors, not success messages
      setIsErrorDialogOpen(true);
    } else {
      setIsErrorDialogOpen(false);
    }
  }, [error]);

  const allRowsSelected = selectedRows.size > 0 && selectedRows.size === rows.length;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center">أداة استخراج الكلمات المفتاحية</h1>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إعدادات الميزات المتقدمة</DialogTitle>
            <DialogDescription>
              تحكم في الميزات الإضافية لتخصيص عملية استخراج وتحليل الكلمات المفتاحية.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="extractTitleH1"
                checked={settings.extractTitleH1}
                onCheckedChange={(checked: boolean | 'indeterminate') => handleSettingChange('extractTitleH1', Boolean(checked))} // Fixed type
              />
              <Label htmlFor="extractTitleH1">تحليل عنوان الصفحة (&lt;title&gt;) وعلامة H1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="detectDuplicates"
                checked={settings.detectDuplicates}
                onCheckedChange={(checked: boolean | 'indeterminate') => setSettings(prev => ({ ...prev, detectDuplicates: Boolean(checked) }))} // Fixed type
              />
              <Label htmlFor="detectDuplicates">اكتشاف الكلمات المفتاحية المكررة وتجميعها (Frontend)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parseMultimediaSitemaps"
                checked={settings.parseMultimediaSitemaps}
                onCheckedChange={(checked: boolean | 'indeterminate') => handleSettingChange('parseMultimediaSitemaps', Boolean(checked))} // Fixed type
              />
              <Label htmlFor="parseMultimediaSitemaps">تحليل روابط Sitemap للصور والفيديوهات (Backend)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkCanonical"
                checked={settings.checkCanonical}
                onCheckedChange={(checked: boolean | 'indeterminate') => handleSettingChange('checkCanonical', Boolean(checked))} // Fixed type
              />
              <Label htmlFor="checkCanonical">فحص Canonical URL (Backend - قد يبطئ العملية)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estimateCompetition"
                checked={settings.estimateCompetition}
                onCheckedChange={(checked: boolean | 'indeterminate') => handleSettingChange('estimateCompetition', Boolean(checked))} // Fixed type
              />
              <Label htmlFor="estimateCompetition">تقدير مستوى المنافسة للكلمات المفتاحية (Backend - بيانات تقديرية)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urlCategorization"
                checked={settings.urlCategorization}
                onCheckedChange={(checked: boolean | 'indeterminate') => setSettings(prev => ({ ...prev, urlCategorization: Boolean(checked) }))} // Fixed type
              />
              <Label htmlFor="urlCategorization">تصنيف الروابط (مقالة، منتج، فئة...) (Frontend)</Label>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableAdvancedTableFeatures"
                checked={settings.enableAdvancedTableFeatures}
                onCheckedChange={(checked: boolean | 'indeterminate') => setSettings(prev => ({ ...prev, enableAdvancedTableFeatures: Boolean(checked) }))} // Fixed type
              />
              <Label htmlFor="enableAdvancedTableFeatures">تفعيل ميزات الجدول المتقدمة (فرز، تصفية)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من مسح الكل؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى مسح جميع البيانات من الجدول وصناديق النصوص. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={clearTable}>مسح الكل</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Selected Confirmation Dialog */}
      <AlertDialog open={isRemoveSelectedConfirmOpen} onOpenChange={setIsRemoveSelectedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الصفوف المحددة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {selectedRows.size} صفوف محددة من الجدول. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleRemoveSelectedRows(); setIsRemoveSelectedConfirmOpen(false); }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Unselected Confirmation Dialog */}
      <AlertDialog open={isRemoveUnselectedConfirmOpen} onOpenChange={setIsRemoveUnselectedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الصفوف غير المحددة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {rows.length - selectedRows.size} صفوف غير محددة من الجدول. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleRemoveUnselectedRows(); setIsRemoveUnselectedConfirmOpen(false); }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <X className="size-5" /> خطأ!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorDialogOpen(false)}>موافق</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Controls and Text Areas */}
      <Card className="rounded-xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            أداة استخراج الكلمات المفتاحية
          </CardTitle>
          <Button onClick={() => setIsSettingsOpen(true)} variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" /> إعدادات
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Links Input */}
          <div>
            <Label htmlFor="manual-links" className="block text-sm font-medium text-gray-700 mb-1">
              1. أدخل الروابط يدويًا (كل رابط في سطر منفصل)
            </Label>
            <Textarea
              id="manual-links"
              rows={8}
              value={urlsText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUrlsText(e.target.value)} // Fixed type
              placeholder="ضع هنا الروابط، كل رابط في سطر منفصل..."
              className="w-full text-base"
              disabled={isLoading}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUrlExtractClick} disabled={isLoading || !urlsText.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'استخراج من النص'}
              </Button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 font-semibold">أو</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Sitemap URL Input */}
          <div>
            <Label htmlFor="sitemap-url" className="block text-sm font-medium text-gray-700 mb-1">
              2. أدخل رابط الموقع الأساسي لتحليل Sitemap
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Fixed: Input component with icon */}
              <div className="relative flex-grow">
                <Input
                  id="sitemap-url"
                  type="url"
                  placeholder="https://example.com/"
                  value={sitemapUrlInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSitemapUrlInput(e.target.value)} // Fixed type
                  className="w-full pl-10" // Add padding for icon
                  disabled={isLoading}
                />
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
              <Button
                onClick={handleSitemapExtractClick}
                disabled={isLoading || !sitemapUrlInput.trim()}
                className="w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'تحليل Sitemap'}
              </Button>
            </div>
            {isLoading && progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                <p className="text-center text-sm mt-1">{progress.toFixed(0)}% مكتمل</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sitemap Discovery Results */}
      {sitemaps.length > 0 && (
        <Card className="rounded-xl shadow-sm border">
          <CardHeader>
            <CardTitle>ملفات Sitemap المكتشفة ({sitemaps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرابط</TableHead>
                    <TableHead>الروابط/Sitemaps الفرعية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>رسالة الخطأ</TableHead>
                    <TableHead>إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitemaps.map((sitemap: SitemapInfo, index: number) => ( // Fixed types
                    <TableRow key={index}>
                      <TableCell className="break-all text-xs">
                        <a href={sitemap.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          {sitemap.url} <ExternalLink className="size-3" />
                        </a>
                      </TableCell>
                      <TableCell>{sitemap.urlCount !== undefined ? sitemap.urlCount : (sitemap.sitemapsFound?.length || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={sitemap.status === 'success' ? 'default' : 'destructive'}>
                          {sitemap.status === 'success' ? 'نجاح' : 'فشل'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-red-600">{sitemap.errorMessage || '---'}</TableCell>
                      <TableCell>
                        {sitemap.status === 'success' && sitemap.urlCount !== undefined && sitemap.urlCount > 0 && (
                          <Button variant="outline" size="sm" onClick={() => handleExtractFromSitemap(sitemap.url)} disabled={isLoading}>
                            معالجة هذا Sitemap
                          </Button>
                        )}
                        {/* Optionally, if it's a sitemap index that wasn't fully processed, you could add a re-process button */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {rows.length > 0 && (
        <Card className="rounded-xl shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              النتائج المستخرجة ({rows.length} رابط)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopySelected}
                disabled={selectedRows.size === 0 || isLoading}
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <Copy className="size-4" /> نسخ المحدد ({selectedRows.size})
              </Button>
              <Button
                onClick={() => setIsRemoveSelectedConfirmOpen(true)}
                disabled={selectedRows.size === 0 || isLoading}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="size-4" /> حذف المحدد
              </Button>
              <Button
                onClick={() => setIsRemoveUnselectedConfirmOpen(true)}
                disabled={selectedRows.size === 0 || selectedRows.size === rows.length || isLoading}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="size-4" /> حذف غير المحدد
              </Button>
              <Button onClick={() => setIsClearConfirmOpen(true)} variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="size-4" /> مسح الجدول
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {settings.enableAdvancedTableFeatures && (
              <div className="p-4 border-b">
                {/* Fixed: Input component with icon */}
                <div className="relative max-w-sm">
                  <Input
                    type="text"
                    placeholder="تصفية النتائج (بحث في كل الأعمدة)..."
                    value={filterText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)} // Fixed type
                    className="w-full pl-10" // Add padding for icon
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <div className="overflow-auto max-h-[600px] w-full"> {/* Max height for scrollable table */}
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allRowsSelected}
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectAll(Boolean(checked))} // Fixed type
                        aria-label="تحديد الكل"
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px] cursor-pointer" onClick={() => requestSort('url')}>الرابط {sortConfig?.key === 'url' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="min-w-[150px] cursor-pointer" onClick={() => requestSort('keyword')}>الكلمة المفتاحية {sortConfig?.key === 'keyword' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                    {settings.extractTitleH1 && (
                      <>
                        <TableHead className="min-w-[200px] cursor-pointer" onClick={() => requestSort('title')}>العنوان (Title) {sortConfig?.key === 'title' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                        <TableHead className="min-w-[150px] cursor-pointer" onClick={() => requestSort('h1')}>العنوان الرئيسي (H1) {sortConfig?.key === 'h1' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                      </>
                    )}
                    {settings.checkCanonical && (
                      <>
                        <TableHead className="min-w-[100px] cursor-pointer" onClick={() => requestSort('isCanonical')}>Canonical {sortConfig?.key === 'isCanonical' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                        <TableHead className="min-w-[200px]">Canonical URL</TableHead>
                      </>
                    )}
                    {settings.estimateCompetition && (
                      <TableHead className="min-w-[120px] cursor-pointer" onClick={() => requestSort('competitionEstimate')}>المنافسة {sortConfig?.key === 'competitionEstimate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                    )}
                    {settings.urlCategorization && (
                      <TableHead className="min-w-[120px] cursor-pointer" onClick={() => requestSort('urlCategory')}>التصنيف {sortConfig?.key === 'urlCategory' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRows.length === 0 && filterText && (
                    <TableRow>
                      <TableCell colSpan={
                        3 + // Checkbox, URL, Keyword
                        (settings.extractTitleH1 ? 2 : 0) +
                        (settings.checkCanonical ? 2 : 0) +
                        (settings.estimateCompetition ? 1 : 0) +
                        (settings.urlCategorization ? 1 : 0)
                      } className="text-center text-muted-foreground py-4">
                        لا توجد نتائج مطابقة لـ "{filterText}".
                      </TableCell>
                    </TableRow>
                  )}
                  {displayedRows.map((row: KeywordExtractionRow) => ( // Fixed type
                    <TableRow key={row.id} className={selectedRows.has(row.id) ? 'bg-primary/10' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => handleSelect(row.id)} // Fixed type
                          aria-label={`تحديد الصف ${row.id}`}
                        />
                      </TableCell>
                      <TableCell className="break-all text-xs">
                        <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          {row.url} <ExternalLink className="size-3" />
                        </a>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{row.keyword}</TableCell>
                      {settings.extractTitleH1 && (
                        <>
                          <TableCell className="text-xs">{row.title || '---'}</TableCell>
                          <TableCell className="text-xs">{row.h1 || '---'}</TableCell>
                        </>
                      )}
                      {settings.checkCanonical && (
                        <>
                          <TableCell>
                            {row.isCanonical === true ? 'نعم' : row.isCanonical === false ? 'لا' : '---'}
                          </TableCell>
                          <TableCell className="break-all text-xs">
                            {row.canonicalUrl && row.canonicalUrl !== row.url ? (
                              <a href={row.canonicalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                {row.canonicalUrl} <ExternalLink className="size-3" />
                              </a>
                            ) : '---'}
                          </TableCell>
                        </>
                      )}
                      {settings.estimateCompetition && (
                        <TableCell className="text-xs">{row.competitionEstimate || '---'}</TableCell>
                      )}
                      {settings.urlCategorization && (
                        <TableCell className="text-xs">{row.urlCategory || '---'}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Separate Text Areas for URLs and Keywords (from original request) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-xl shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">الروابط فقط</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard(urlsText)}
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <Copy className="size-4" /> نسخ الكل
              </Button>
              <Button
                onClick={() => setUrlsText('')}
                variant="destructive"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="size-4" /> مسح
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <Textarea
              rows={10}
              value={urlsText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUrlsText(e.target.value)} // Fixed type
              className="w-full text-xs font-mono"
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">الكلمات المفتاحية فقط</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard(keywordsText)}
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <Copy className="size-4" /> نسخ الكل
              </Button>
              <Button
                onClick={() => setKeywordsText('')}
                variant="destructive"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="size-4" /> مسح
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <Textarea
              rows={10}
              value={keywordsText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setKeywordsText(e.target.value)} // Fixed type
              className="w-full text-sm font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

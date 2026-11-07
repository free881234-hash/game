# 다크월드 웹 버전 로컬 실행기: 이 폴더를 http://localhost 로 열어 크롬에서 실행합니다.
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
if (-not $root.EndsWith('\')) { $root += '\' }
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.wasm' = 'application/wasm'
  '.json' = 'application/json'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.mp3' = 'audio/mpeg'; '.wav' = 'audio/wav'
  '.ttf' = 'font/ttf'; '.tsv' = 'text/plain; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'; '.pack' = 'application/octet-stream'
}
$listener = $null
$port = 0
foreach ($p in 8765..8785) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try { $l.Start(); $listener = $l; $port = $p; break } catch { $l.Close() }
}
if (-not $listener) {
  Write-Host '실행할 수 있는 포트를 찾지 못했습니다 (8765~8785 모두 사용 중).'
  Read-Host '엔터를 누르면 닫힙니다'
  exit 1
}
$url = "http://localhost:$port/"
Write-Host ''
Write-Host '  다크월드 웹 버전 실행 중'
Write-Host "  주소: $url"
Write-Host '  게임을 하는 동안 이 창을 닫지 마세요. (닫으면 게임 서버가 꺼집니다)'
Write-Host ''
try { Start-Process 'chrome' $url } catch { Start-Process $url }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root ($path.TrimStart('/').Replace('/', '\'))))
    if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($file)) {
      $res.StatusCode = 404
    } else {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] } else { $res.ContentType = 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $bytes = [IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}

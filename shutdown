Add-Type -AssemblyName System.Windows.Forms

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Definition
$filePath = "$scriptDirectory\RemainingTime.txt"
$resetFilePath = "$scriptDirectory\ResetSignal.txt"

# Create the form
$form = New-Object Windows.Forms.Form
$form.Text = "Shutdown Countdown"
$form.Size = New-Object Drawing.Size(500, 200)
$form.StartPosition = "CenterScreen"

# Create the label
$label = New-Object Windows.Forms.Label
$label.Text = ""
$label.AutoSize = $true
$label.Font = New-Object Drawing.Font("Arial", 14)
$label.Location = New-Object Drawing.Point(50, 50)

# Create the reset button
$resetButton = New-Object Windows.Forms.Button
$resetButton.Text = "Reset Timer"
$resetButton.Location = New-Object Drawing.Point(200, 100)
$resetButton.AutoSize = $true
$resetButton.Add_Click({
    New-Item -Path $resetFilePath -ItemType File -Force
})

# Add controls to the form
$form.Controls.Add($label)
$form.Controls.Add($resetButton)

# Create the notify icon
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
$notifyIcon.Visible = $true

function Center-Items {
    param (
        [System.Windows.Forms.Label]$label,
        [System.Windows.Forms.Button]$button,
        [System.Windows.Forms.Form]$form
    )
    $label.Left = ($form.ClientSize.Width - $label.Width) / 2
    $button.Left = ($form.ClientSize.Width - $button.Width) / 2
}

# Function to update the label
function Update-Label {
    param (
        [int]$minutes,
        [int]$seconds
    )
    $label.Text = "Shutting down in $minutes minutes and $seconds seconds"
}

# Function to show notifications
function Show-Notification {
    param (
        [string]$message
    )
    $notifyIcon.BalloonTipText = $message
    $notifyIcon.ShowBalloonTip(10000)  # Show for 10 seconds
}

# Timer to refresh the label and show notifications every second
$notificationTimes = @(3599, 1800, 600, 300, 60, 30, 25, 20, 15, 10, 5, 1)
$notifiedTimes = @{}
$timer = New-Object Windows.Forms.Timer
$timer.Interval = 1000  # 1 second
$timer.Add_Tick({
    try {
        $stream = [System.IO.File]::Open($filePath, 'Open', 'Read', 'ReadWrite')
        $reader = New-Object System.IO.StreamReader($stream)
        $remainingTime = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()

        if ($null -ne $remainingTime) {
            $parts = $remainingTime -split " "
            $minutes = [int]$parts[0]
            $seconds = [int]$parts[1]
            $timeLeft = ($minutes * 60) + $seconds
            foreach ($notificationTime in $notificationTimes) {
                if ($timeLeft -eq $notificationTime -and -not $notifiedTimes.Contains($notificationTime)) {
                    Show-Notification "$([math]::Floor($notificationTime / 60)) minutes and $($notificationTime % 60) second(s) left before shutdown"
                    $notifiedTimes += $notificationTime
                }
            }
            Update-Label $minutes $seconds
        } else {
            Update-Label 0 0
        }
    } catch {
         Update-Label 0 0
    }
})

# Form load event to start the timer
$form.Add_Load({
    $timer.Start()
    Update-Label 60 0
    Center-Items -label $label -button $resetButton -form $form
})

# Show the form
[void]$form.ShowDialog()

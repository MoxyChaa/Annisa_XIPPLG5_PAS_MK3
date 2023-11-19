// membuat array dengan warna-warna dari candy 
var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
// board akan menjadi array 2d yg akan menanpung semua tag gambar candy dan jika candy di hancurkan akan membuat yang baru
var board = [];
// membuat baris dan  kolom 9x9
var rows = 9;
var columns = 9;
// start score dari 0
var score = 0;

var currTile;
var otherTile;

// ketika web dibuka maka akan ada loading lalu start game
window.onload = function() {
    startGame();
    // untuk play sound otomatis saat web dibuka
    playCrushSound();

    // menjalankan fungsi looping 
    window.setInterval(function(){
        // fungsi untuk menghancurkan candy in game
        crushCandy();
        // menggeser candy in game
        slideCandy();
        // membuat candy baru jika ada yang hancur
        generateCandy();
    }, 100);
}

function playCrushSound() {
    var crushAudio = document.getElementById("crushSound");
    crushAudio.play();
}

// untuk mengacak array candy
function randomCandy() {
    // untuk menghasilkan angka acak dan menggunakannya sebagai indeks untuk mengakses array candies
    return candies[Math.floor(Math.random() * candies.length)]; //0 - 5.99
}

function startGame() {
    // loop luar yang digunakan untuk membuat baris-baris pada papan permainan. jumlah baris yang akan dibuat ditentukan oleh variabel rows
    for (let r = 0; r < rows; r++) {
        //  setiap iterasi loop luar, membuat array kosong (row) yang akan mewakili satu baris pada papan permainan
        let row = [];
        // loop dalam yang digunakan untuk membuat kolom-kolom di dalam setiap baris. jumlah kolom yang akan dibuat ditentukan oleh variabel columns
        for (let c = 0; c < columns; c++) {
            //  membuat elemen gambar HTML baru untuk mewakili satu elemen pada papan permainan
            let tile = document.createElement("img");
            //  menetapkan id untuk setiap elemen gambar, yang mencakup indeks baris dan kolom
            tile.id = r.toString() + "-" + c.toString();
            // untuk memilih elemen gambar secara acak dari array candies
            tile.src = "./images/" + randomCandy() + ".png";

            //DRAG FUNCTIONALITY
            tile.addEventListener("dragstart", dragStart); //klik pada candy, memulai proses drag
            tile.addEventListener("dragover", dragOver);  //klik pada candy, mouse bergerak untuk proses drag candy
            tile.addEventListener("dragenter", dragEnter); //drag candy ke dalam candy lain
            tile.addEventListener("dragleave", dragLeave); //menghilangkan permen dari permen lainnya
            tile.addEventListener("drop", dragDrop); //drop candy kedalam candy lainnya
            tile.addEventListener("dragend", dragEnd); //setelah proses drag selesai, kita menukarkan candy

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

function dragStart() {
    //pada tile yang telah diklik untuk dragging
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {

}

function dragDrop() {
    //ini mengacu pada target yang ditempatkan pada
    otherTile = this;
}

// logika swap elemen gambar pada board permainan
function dragEnd() {
    // untuk memeriksa apakah salah satu dari elemen gambar currTile atau otherTile memiliki sumber gambar yang mengandung kata blank. jika iya, maka tidak melakukan pertukaran dan fungsi return 
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
        return;
    }
    // bagian ini memecah id elemen gambar currTile dan otherTile yang berupa string baris-kolom menjadi array yang berisi nilai baris dan kolom. nilai ini kemudian diubah menjadi integer menggunakan parseInt
    let currCoords = currTile.id.split("-"); // id="0-0" -> ["0", "0"]
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    // dibuat variabel-variabel boolean (moveLeft, moveRight, moveUp, moveDown) yang menunjukkan apakah elemen gambar lain (otherTile) berada di sebelah kiri, kanan, atas, atau bawah dari elemen gambar saat ini (currTile). isAdjacent akan menjadi true jika elemen gambar lain berada di salah satu dari empat arah tersebut
    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c-1 && r == r2;
    let moveRight = c2 == c+1 && r == r2;

    let moveUp = r2 == r-1 && c == c2;
    let moveDown = r2 == r+1 && c == c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    // jika elemen gambar lain (otherTile) berada di sebelah elemen gambar saat ini (currTile), maka dilakukan pertukaran sumber gambar di antara keduanya
    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;
        currTile.src = otherImg;
        otherTile.src = currImg;

        // fungsi checkValid() digunakan untuk memeriksa apakah pertukaran tersebut menghasilkan suatu keadaan yang valid dalam konteks game
        // jika pertukaran tidak valid, maka dilakukan pertukaran kembali sehingga elemen gambar tetap berada pada posisi awalnya
        // ini untuk menghindari pertukaran yang tidak diizinkan dalam game
        let validMove = checkValid();
        if (!validMove) {
            let currImg = currTile.src;
            let otherImg = otherTile.src;
            currTile.src = otherImg;
            otherTile.src = currImg;    
        }
    }
}

function crushCandy() {
    // fungsi crushThree dipanggil, untuk menghancurkan kombinasi tiga elemen yang serupa
    crushThree();
    // Mengupdate elemen dengan id score pada dokumen HTML dengan nilai score
    document.getElementById("score").innerText = score;
}

// untuk menghancurkan kombinasi tiga elemen yang serupa secara horizontal pada board permainan
function crushThree() {
    //untuk mengiterasi melalui setiap elemen pada setiap baris dan kolom pada board permainan
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns-2; c++) {
            // membuat referensi ke tiga elemen berturut-turut dalam satu baris untuk memeriksa apakah ketiganya memiliki sumber gambar yang sama
            let candy1 = board[r][c];
            let candy2 = board[r][c+1];
            let candy3 = board[r][c+2];
            // untuk mengecek apakah sumber gambar ketiga elemen tersebut sama dan tidak termasuk elemen yang kosong "blank". jika iya, maka ini menunjukkan adanya kombinasi tiga elemen yang serupa
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                // mengganti sumber gambar ketiga elemen tersebut dengan gambar elemen kosong
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                // menambahkan 30 score setiap menghancurkan elemen
                score += 30;
            }
        }
    }

    // untuk menghancurkan kombinasi tiga elemen yang serupa secara vertikal pada board permainan
    for (let c = 0; c < columns; c++) {
        //untuk mengiterasi melalui setiap elemen pada setiap baris dan kolom pada board permainan
        for (let r = 0; r < rows-2; r++) {
            // membuat referensi ke tiga elemen berturut-turut dalam satu baris untuk memeriksa apakah ketiganya memiliki sumber gambar yang sama
            let candy1 = board[r][c];
            let candy2 = board[r+1][c];
            let candy3 = board[r+2][c];
            // untuk mengecek apakah sumber gambar ketiga elemen tersebut sama dan tidak termasuk elemen yang kosong "blank". jika iya, maka ini menunjukkan adanya kombinasi tiga elemen yang serupa
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                // mengganti sumber gambar ketiga elemen tersebut dengan gambar elemen kosong
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                // menambahkan 30 score setiap menghancurkan elemenh
                score += 30;
            }
        }
    }
}

// untuk memeriksa apakah ada kombinasi tiga elemen yang serupa secara horizontal pada papan permainan. jika ya, fungsi mengembalikan true, yang akan menunjukkan bahwa ada gerakan yang valid yang dapat dilakukan oleh pemain
function checkValid() {
    //looping
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns-2; c++) {
            // membuat referensi ke tiga elemen berturut-turut dalam satu baris. untuk memeriksa apakah ketiganya memiliki sumber gambar yang sama
            let candy1 = board[r][c];
            let candy2 = board[r][c+1];
            let candy3 = board[r][c+2];
             // mengganti sumber gambar ketiga elemen tersebut dengan gambar elemen kosong
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                // jika ditemukan kombinasi tiga elemen yang serupa secara horizontal, maka fungsi langsung mengembalikan true, yang menunjukkan bahwa ada gerakan yang valid yang dapat dilakukan oleh pemain
                return true;
            }
        }
    }

    // untuk berfokus pada memeriksa apakah ada kombinasi tiga elemen yang serupa secara vertikal pada board permainan
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows-2; r++) {
            // // membuat referensi ke tiga elemen berturut-turut dalam satu baris. untuk memeriksa apakah ketiganya memiliki sumber gambar yang sama
            let candy1 = board[r][c];
            let candy2 = board[r+1][c];
            let candy3 = board[r+2][c];
            // mengganti sumber gambar ketiga elemen tersebut dengan gambar elemen kosong
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                // jika ditemukan kombinasi tiga elemen yang serupa secara vertikal, maka fungsi langsung mengembalikan true, yang menunjukkan bahwa ada gerakan yang valid yang dapat dilakukan oleh pemain
                return true;
            }
        }
    }

    return false;
}

// logika penggeseran candy pada papan permainan setelah candy-candy dihancurkan
function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = columns-1; r >= 0; r--) {
            // looping 1 : ini berfungsi untuk memindahkan candy yang tidak kosong ke bawah kolom. variabel ind menunjukkan baris tempat candy akan dipindahkan
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        // looping 2 : untuk mengisi candy-candy kosong yang tersisa dengan gambar candy kosong
        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

// logika penggantian candy pada papan permainan setelah candy dihancurkan
function generateCandy() {
    // loop ini mengecek setiap kolom di baris teratas papan permainan.
    for (let c = 0; c < columns;  c++) {
        // jika candy pada posisi tersebut adalah kosong, maka candy tersebut diisi dengan gambar candy baru yang dihasilkan menggunakan fungsi randomCandy
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = "./images/" + randomCandy() + ".png";
        }
    }
}
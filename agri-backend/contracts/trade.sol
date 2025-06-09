pragma solidity ^0.8.20;

contract Trade {
    struct Crop {
        uint id;
        string name;
        uint price;
         uint quantity;
        address payable farmer;
        bool sold;
    }

    uint public cropCount = 0;
    mapping(uint => Crop) public crops;

    event CropListed(uint id, string name, uint price, address farmer);
    event CropSold(uint id, address buyer, uint price);

  function addCrop(string memory _name, uint _price, uint _quantity) public {
    require(_price > 0, "Price must be greater than 0");
    cropCount++;
    crops[cropCount] = Crop(cropCount, _name, _price, _quantity, payable(msg.sender), false);
    emit CropListed(cropCount, _name, _price, msg.sender);
}


    function buyCrop(uint _id) public payable {
        Crop storage crop = crops[_id];
        require(_id > 0 && _id <= cropCount, "Invalid Crop ID");
        require(msg.value >= crop.price, "Not enough funds");
        require(!crop.sold, "Crop already sold");

        crop.farmer.transfer(msg.value);
        crop.sold = true;

        emit CropSold(_id, msg.sender, crop.price);
    }
}